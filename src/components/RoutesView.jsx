export default function RoutesView({ routes }) {
  return (
    <section className="card p-4">
      <h3 className="mb-4 text-lg font-semibold">Active Routes</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-400">
            <tr>
              <th className="py-2">Route ID</th>
              <th>Route</th>
              <th>Assigned Aircraft</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={route.id} className="border-t border-slate-800">
                <td className="py-2 font-medium text-sky-300">{route.id}</td>
                <td>{route.route}</td>
                <td>{route.aircraft}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
