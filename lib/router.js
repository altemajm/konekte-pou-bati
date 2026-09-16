// Routeur minimaliste : associe methode + chemin (avec parametres :id) a un handler.

function pathToRegex(routePath) {
  const paramNames = [];
  const pattern = routePath
    .replace(/\/+$/, "") // pas de slash final
    .split("/")
    .map((segment) => {
      if (segment.startsWith(":")) {
        paramNames.push(segment.slice(1));
        return "([^/]+)";
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("/");
  return { regex: new RegExp(`^${pattern || "/"}$`), paramNames };
}

class Router {
  constructor() {
    this.routes = []; // { method, regex, paramNames, handler }
  }

  add(method, routePath, handler) {
    const { regex, paramNames } = pathToRegex(routePath);
    this.routes.push({ method: method.toUpperCase(), regex, paramNames, handler });
  }

  get(p, h) { this.add("GET", p, h); }
  post(p, h) { this.add("POST", p, h); }

  match(method, urlPath) {
    const cleanPath = urlPath.replace(/\/+$/, "") || "/";
    for (const route of this.routes) {
      if (route.method !== method) continue;
      const m = route.regex.exec(cleanPath);
      if (!m) continue;
      const params = {};
      route.paramNames.forEach((name, i) => { params[name] = decodeURIComponent(m[i + 1]); });
      return { handler: route.handler, params };
    }
    return null;
  }
}

module.exports = Router;
