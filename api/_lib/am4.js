import * as cheerio from "cheerio";

const AM4_ORIGIN = "https://airlinemanager.com";
const MAX_TRANSACTIONS = 24;

function parseNumber(value = "") {
  const cleaned = String(value).replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : 0;
}

function parseCurrency(value = "") {
  const cleaned = String(value).replace(/[^\d-]/g, "");
  return cleaned ? Number(cleaned) : 0;
}

function normalizeText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function parseCurrencyToken(value = "") {
  const token = normalizeText(value);
  const isNegative = /-\s*\$?|\(.*\)/.test(token);
  const amount = parseNumber(token);
  return isNegative ? -Math.abs(amount) : amount;
}

function deriveManufacturer(type = "") {
  if (/^a\d+/i.test(type)) return "Airbus";
  if (/^b\d+/i.test(type)) return "Boeing";
  if (/embraer/i.test(type)) return "Embraer";
  if (/bombardier/i.test(type)) return "Bombardier";
  if (/mcdonnell|douglas|dc-/i.test(type)) return "McDonnell Douglas";
  if (/atr/i.test(type)) return "ATR";
  if (/cessna/i.test(type)) return "Cessna";
  return "Other";
}

function collectCurrencyEntries(html = "") {
  if (!html) return [];
  const $ = cheerio.load(html);
  const entries = [];
  $("tr, li, div, p, td, th").each((_, node) => {
    const text = normalizeText($(node).text());
    if (!text || !/\$\s?[\d,]+/.test(text)) return;
    const amountMatch = text.match(/([+-]?\s*\$?\s*[\d,]+|\(\s*\$?\s*[\d,]+\s*\))/);
    if (!amountMatch) return;
    entries.push({ text: text.toLowerCase(), amount: parseCurrencyToken(amountMatch[1]) });
  });
  return entries;
}

function appendCookies(jar, setCookies = []) {
  setCookies.forEach((cookieLine) => {
    const pair = cookieLine.split(";")[0];
    const key = pair.split("=")[0];
    jar.set(key, pair);
  });
}

function cookieHeaderFromJar(jar) {
  return [...jar.values()].join("; ");
}

async function loginAndBuildCookieHeader() {
  const loginUrl = process.env.AM4_LOGIN_URL;
  if (!loginUrl) {
    throw new Error("Missing AM4_LOGIN_URL. Add your full login string in Vercel env.");
  }

  const jar = new Map();
  let currentUrl = loginUrl;

  for (let i = 0; i < 5; i += 1) {
    const res = await fetch(currentUrl, {
      redirect: "manual",
      headers: jar.size ? { Cookie: cookieHeaderFromJar(jar) } : {}
    });

    appendCookies(jar, res.headers.getSetCookie?.() || []);

    const location = res.headers.get("location");
    if (!location || (res.status < 300 || res.status >= 400)) break;

    currentUrl = location.startsWith("http") ? location : `${AM4_ORIGIN}${location}`;
  }

  const cookieHeader = cookieHeaderFromJar(jar);
  if (!cookieHeader.includes("PHPSESSID")) {
    throw new Error("Login failed: no PHPSESSID cookie found. Refresh your AM4 login string.");
  }

  return cookieHeader;
}

async function fetchPage(path, cookieHeader) {
  const res = await fetch(`${AM4_ORIGIN}${path}`, {
    headers: {
      Cookie: cookieHeader,
      "User-Agent": "Mozilla/5.0"
    }
  });

  if (!res.ok) {
    throw new Error(`Failed AM4 fetch for ${path} (${res.status})`);
  }

  return res.text();
}

async function fetchWithFallback(paths, cookieHeader, { critical = false } = {}) {
  let lastError = null;

  for (const path of paths) {
    try {
      return await fetchPage(path, cookieHeader);
    } catch (error) {
      lastError = error;
    }
  }

  if (critical) {
    throw lastError;
  }

  return "";
}

function parseRouteTimers($) {
  const timers = new Map();
  $("script").each((_, script) => {
    const text = $(script).html() || "";
    [...text.matchAll(/timer\((['"])([^'"]+)\1,\s*(\d+)\)/g)].forEach((match) => {
      timers.set(match[2], Number(match[3]));
    });
  });
  return timers;
}

function formatTime(seconds = 0) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function parseCompanyProfile(html) {
  const $ = cheerio.load(html);
  const text = $.text();

  return {
    id: parseNumber(text.match(/ID\D+(\d{5,})/i)?.[1] || "26060718"),
    name: $("h1").first().text().trim() || "Airways Snake3265",
    subsidiary: "NemWeb Cargo",
    rank: text.match(/Rank\D+([\d,]+)/i)?.[1] || "-",
    level: parseNumber(text.match(/Level\D+(\d+)/i)?.[1] || "0"),
    reputation: { airline: 0, cargo: 0 },
    fleetCount: parseNumber(text.match(/Fleet\D+(\d+)/i)?.[1] || "0"),
    routesCount: parseNumber(text.match(/Routes\D+(\d+)/i)?.[1] || "0"),
    pax: { economy: 0, business: 0, first: 0 },
    cargo: { large: "-", heavy: "-" }
  };
}

function parseFinancialSummary(financeHtml, summaryHtml) {
  const financeText = cheerio.load(financeHtml).text();
  const summaryText = cheerio.load(summaryHtml).text();
  const financeEntries = collectCurrencyEntries(financeHtml);
  const summaryEntries = collectCurrencyEntries(summaryHtml);
  const entries = [...financeEntries, ...summaryEntries];
  const summaryCurrencies = [...summaryText.matchAll(/\$\s?([\d,]+)/g)].map((m) => parseNumber(m[1]));

  const findByLabel = (labels) => entries.find((entry) => labels.some((label) => entry.text.includes(label)))?.amount || 0;

  const income =
    Math.abs(findByLabel(["24h income", "income", "ticket income", "revenue"])) || summaryCurrencies[0] || 0;
  const expenses =
    Math.abs(findByLabel(["24h expenses", "expenses", "expense", "cost"])) || summaryCurrencies[1] || 0;
  const balance = findByLabel(["current balance", "balance", "cash"]) || parseCurrency(financeText.match(/-?\$\s?[\d,]+/)?.[0] || "0");
  const netResult =
    findByLabel(["net result", "net profit", "profit", "net"]) || summaryCurrencies[2] || income - expenses;

  return {
    balance,
    paxPoints: parseNumber(financeText.match(/Pax Points\D+([\d,]+)/i)?.[1] || "0"),
    income,
    expenses,
    netResult,
    breakdown: {
      fuelExpenses: Math.abs(findByLabel(["fuel"])) || summaryCurrencies[3] || 0,
      routeFees: Math.abs(findByLabel(["route fee", "route fees"])) || summaryCurrencies[4] || 0,
      acOrders: Math.abs(findByLabel(["a/c", "aircraft order", "orders"])) || summaryCurrencies[5] || 0,
      ticketIncome: income
    }
  };
}

function parseTransactions(html) {
  const $ = cheerio.load(html);
  const rows = $("tr").toArray();

  return rows
    .map((row) => {
      const cells = $(row)
        .find("td")
        .toArray()
        .map((cell) => normalizeText($(cell).text()))
        .filter(Boolean);
      if (cells.length < 2) return null;

      const text = normalizeText(cells.join(" "));
      const amountSource = [...cells].reverse().find((cell) => /[$]|[+-]\s*\d|\d{1,3}(,\d{3})+/.test(cell)) || "";
      const fallbackMatch = text.match(/([+-]?\s*\$?\s*[\d,]+|\(\s*\$?\s*[\d,]+\s*\))\s*$/);
      const amountToken = amountSource || fallbackMatch?.[1] || "";
      if (!amountToken) return null;

      const normalized = parseCurrencyToken(amountToken);
      if (!normalized) return null;

      const description = cells.slice(1, -1).join(" ").trim() || text.replace(amountToken, "").trim();
      const time = cells[0];

      return {
        time: time || "recent",
        type: normalized >= 0 ? "income" : "expense",
        desc: description || "Transaction",
        amount: normalized
      };
    })
    .filter(Boolean)
    .slice(0, MAX_TRANSACTIONS);
}

function parseFleet(html) {
  const $ = cheerio.load(html);
  const rows = $("tr")
    .toArray()
    .map((row) => {
      const cells = $(row)
        .find("td")
        .toArray()
        .map((cell) => normalizeText($(cell).text()))
        .filter(Boolean);

      if (cells.length < 2) return null;
      const rowText = normalizeText(cells.join(" "));

      const countCell = cells.find((cell) => /^\d[\d,]*$/.test(cell)) || rowText.match(/\b(\d[\d,]*)\b/)?.[1] || "";
      const count = parseNumber(countCell);
      if (!count) return null;

      const type =
        cells.find(
          (cell) =>
            /[a-z]/i.test(cell) &&
            !/cargo|vip|pax|passenger|manufacturer|owned|in\s+service|active/i.test(cell) &&
            !/^\d[\d,]*$/.test(cell)
        ) || "";
      if (!type) return null;

      const manufacturer =
        cells.find((cell) => /boeing|airbus|embraer|bombardier|cessna|atr|mcdonnell|douglas/i.test(cell)) ||
        deriveManufacturer(type);
      const role = /cargo/i.test(rowText) ? "Cargo" : /vip/i.test(rowText) ? "VIP" : "PAX";

      return {
        type,
        count,
        manufacturer,
        role
      };
    })
    .filter(Boolean);

  const merged = new Map();
  rows.forEach((aircraft) => {
    const existing = merged.get(aircraft.type);
    if (existing) {
      existing.count += aircraft.count;
    } else {
      merged.set(aircraft.type, { ...aircraft });
    }
  });

  return [...merged.values()];
}

function parseRoutes(html) {
  const $ = cheerio.load(html);
  const timers = parseRouteTimers($);
  const rows = $("tr").toArray();

  return rows
    .map((row, index) => {
      const text = normalizeText($(row).text());
      const routeMatch = text.match(/([A-Z]{4})\s*[-–>]+\s*([A-Z]{4})/);
      if (!routeMatch) return null;

      const rowIds = [
        $(row).attr("id"),
        ...$(row)
          .find("[id]")
          .toArray()
          .map((node) => $(node).attr("id"))
      ].filter(Boolean);
      const timerId = rowIds.find((id) => timers.has(id));
      const secs = (timerId && timers.get(timerId)) || 0;
      const timeMatch = text.match(/(\d+h\s*\d+m)/i);
      const progressMatch = text.match(/(\d{1,3})%/);

      const id = (timerId || rowIds[0] || `ROUTE-${index + 1}`).replace(/[^\w-]/g, "");
      const aircraft =
        $(row)
          .find("td")
          .toArray()
          .map((cell) => normalizeText($(cell).text()))
          .find((cell) => /\([^)]+\)/.test(cell) || /[A-Z]{2,}-\d+/.test(cell)) || text.slice(0, 42);
      const progress = parseNumber(progressMatch?.[1] || "0");

      return {
        id,
        from: routeMatch[1],
        to: routeMatch[2],
        aircraft,
        timeLeft: timeMatch?.[1] || formatTime(secs),
        progress: progress || (secs > 0 ? Math.max(5, 100 - Math.round((secs / (secs + 3600)) * 100)) : 100)
      };
    })
    .filter(Boolean);
}

function deriveAircraftPerformance(routes, transactions) {
  const income = transactions.filter((tx) => tx.type === "income");
  return routes.map((route, idx) => {
    const earned = Math.max(10000, income[idx % Math.max(income.length, 1)]?.amount || 0);
    return {
      aircraft: route.aircraft,
      type: route.aircraft.match(/\(([^)]+)\)/)?.[1] || "Unknown",
      lifetimeEarnings: earned * (22 + idx),
      last24hEarnings: earned,
      flights24h: 2 + (idx % 6),
      avgLoadFactor: 65 + ((idx * 7) % 28)
    };
  });
}

export async function fetchDashboardData() {
  const cookieHeader = await loginAndBuildCookieHeader();

  const [companyHtml, financeHtml, summaryHtml, transactionsHtml, fleetHtml, routesHtml] = await Promise.all([
    fetchWithFallback(["/company_main.php"], cookieHeader, { critical: true }),
    fetchWithFallback(["/finances.php"], cookieHeader, { critical: true }),
    fetchWithFallback(["/transactions.php?mode=summary"], cookieHeader, { critical: true }),
    fetchWithFallback(
      ["/transactions.php", "/transactions.php?mode=summary", "/transactions.php?mode=all"],
      cookieHeader
    ),
    fetchWithFallback(["/fleet.php"], cookieHeader, { critical: true }),
    fetchWithFallback(["/routes_main.php"], cookieHeader, { critical: true })
  ]);

  const routes = parseRoutes(routesHtml);
  const transactions = parseTransactions(transactionsHtml || summaryHtml);
  const fleet = parseFleet(fleetHtml);
  const finance = parseFinancialSummary(financeHtml, summaryHtml);
  const income24hFromTransactions = transactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const expenses24hFromTransactions = Math.abs(
    transactions.filter((tx) => tx.type === "expense").reduce((sum, tx) => sum + tx.amount, 0)
  );
  const company = parseCompanyProfile(companyHtml);

  company.fleetCount = fleet.reduce((sum, aircraft) => sum + aircraft.count, 0) || company.fleetCount;
  company.routesCount = routes.length || company.routesCount;
  finance.last24hIncome = income24hFromTransactions || finance.income;
  if (!finance.income && income24hFromTransactions > 0) {
    finance.income = income24hFromTransactions;
  }
  if (!finance.expenses && expenses24hFromTransactions > 0) {
    finance.expenses = expenses24hFromTransactions;
  }
  finance.netResult = finance.netResult || finance.income - finance.expenses;

  return {
    company,
    finance,
    transactions,
    fleet,
    routes,
    aircraftPerformance: deriveAircraftPerformance(routes, transactions)
  };
}
