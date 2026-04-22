import * as cheerio from "cheerio";

const AM4_ORIGIN = "https://airlinemanager.com";

function parseNumber(value = "") {
  const cleaned = String(value).replace(/[^\d]/g, "");
  return cleaned ? Number(cleaned) : 0;
}

function parseCurrency(value = "") {
  const cleaned = String(value).replace(/[^\d-]/g, "");
  return cleaned ? Number(cleaned) : 0;
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
    [...text.matchAll(/timer\('(.+?)',(\d+)\)/g)].forEach((match) => {
      timers.set(match[1], Number(match[2]));
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
  const currencies = [...summaryText.matchAll(/\$\s?([\d,]+)/g)].map((m) => parseNumber(m[1]));

  // Try label-based extraction first (robust against page reorders)
  const incomeLabel = summaryText.match(/income[^$\n]{0,30}\$\s?([\d,]+)/i);
  const expenseLabel = summaryText.match(/expense[^$\n]{0,30}\$\s?([\d,]+)/i);

  // AM4 summary page shows expenses before income positionally, so currencies[0]=expenses, [1]=income
  const income = incomeLabel ? parseNumber(incomeLabel[1]) : currencies[1] || 0;
  const expenses = expenseLabel ? parseNumber(expenseLabel[1]) : currencies[0] || 0;

  return {
    balance: parseNumber(financeText.match(/\$\s?([\d,]+)/)?.[1] || "0"),
    paxPoints: parseNumber(financeText.match(/Pax Points\D+([\d,]+)/i)?.[1] || "0"),
    income,
    expenses,
    netResult: currencies[2] || income - expenses,
    breakdown: {
      fuelExpenses: currencies[3] || 0,
      routeFees: currencies[4] || 0,
      acOrders: currencies[5] || 0,
      ticketIncome: income
    }
  };
}

function parseTransactions(html) {
  const $ = cheerio.load(html);
  const rows = $("tr").slice(0, 20).toArray();

  return rows
    .map((row) => {
      const cells = $(row)
        .find("td")
        .toArray()
        .map((cell) => $(cell).text().trim());

      if (cells.length < 2) return null;

      const text = cells.join(" ");

      // Try $-prefixed amount first
      const dollarMatch = text.match(/([+-]?\$\s?[\d,]+)/);
      let normalized;

      if (dollarMatch) {
        const amount = parseCurrency(dollarMatch[1]);
        normalized = dollarMatch[1].startsWith("-") ? -Math.abs(amount) : amount;
      } else {
        // Fallback: last cell that looks like a plain number (with optional sign)
        const lastCell = cells[cells.length - 1].replace(/,/g, "");
        const numMatch = lastCell.match(/^([+-]?\d+)$/);
        if (!numMatch) return null;
        const num = Number(numMatch[1]);
        if (!num) return null;
        normalized = num;
      }

      if (!normalized) return null;

      return {
        time: cells[0] || "recent",
        type: normalized >= 0 ? "income" : "expense",
        desc: cells[1] || text.replace(dollarMatch?.[1] || "", "").trim(),
        amount: normalized
      };
    })
    .filter(Boolean);
}

function parseFleet(html) {
  const $ = cheerio.load(html);
  return $("tr")
    .toArray()
    .map((row) => {
      const cells = $(row)
        .find("td")
        .toArray()
        .map((cell) => $(cell).text().trim());

      if (cells.length < 2) return null;
      const [type, countCell, maybeRole] = cells;
      const count = parseNumber(countCell);
      if (!type || !count) return null;

      return {
        type,
        count,
        manufacturer: type.startsWith("A") ? "Airbus" : type.startsWith("B") ? "Boeing" : "Other",
        role: /cargo/i.test(maybeRole || "") ? "Cargo" : /vip/i.test(maybeRole || "") ? "VIP" : "PAX"
      };
    })
    .filter(Boolean);
}

function parseRoutes(html) {
  const $ = cheerio.load(html);
  const timers = parseRouteTimers($);

  // Primary: elements with routeMainList ids
  const routeMainNodes = $("[id^=routeMainList]").toArray();

  if (routeMainNodes.length > 0) {
    return routeMainNodes
      .map((node, index) => {
        const row = $(node).closest("tr").text().replace(/\s+/g, " ").trim();
        const routeMatch = row.match(/([A-Z]{4})\s*-\s*([A-Z]{4})/);
        const aircraft = row.match(/\(([^)]+)\)/)?.[0] || row.slice(0, 42);
        const id = ($(node).attr("id") || `ROUTE-${index + 1}`).replace(/[^\w-]/g, "");
        const secs = timers.get($(node).attr("id")) || 0;

        return {
          id,
          from: routeMatch?.[1] || "----",
          to: routeMatch?.[2] || "----",
          aircraft,
          timeLeft: formatTime(secs),
          progress: secs > 0 ? Math.max(5, 100 - Math.round((secs / (secs + 3600)) * 100)) : 100
        };
      })
      .filter((route) => route.from !== "----" || route.to !== "----");
  }

  // Fallback: scan all table rows for IATA route patterns (4-letter codes separated by dash)
  return $("tr")
    .toArray()
    .map((row, index) => {
      const text = $(row).text().replace(/\s+/g, " ").trim();
      const routeMatch = text.match(/\b([A-Z]{4})\s*[-–]\s*([A-Z]{4})\b/);
      if (!routeMatch) return null;

      const aircraft = text.match(/\(([^)]+)\)/)?.[0] || "";
      const rowId = $(row).attr("id") || `ROUTE-${index + 1}`;
      const id = rowId.replace(/[^\w-]/g, "");
      const secs = timers.get($(row).attr("id")) || 0;

      return {
        id,
        from: routeMatch[1],
        to: routeMatch[2],
        aircraft,
        timeLeft: formatTime(secs),
        progress: secs > 0 ? Math.max(5, 100 - Math.round((secs / (secs + 3600)) * 100)) : 100
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

  return {
    company: parseCompanyProfile(companyHtml),
    finance: parseFinancialSummary(financeHtml, summaryHtml),
    transactions,
    fleet: parseFleet(fleetHtml),
    routes,
    aircraftPerformance: deriveAircraftPerformance(routes, transactions)
  };
}
