import { ViewConfig } from "@vaadin/hilla-file-router/types.js";
import { useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { UsuarioService } from "Frontend/generated/endpoints.js";

export const config: ViewConfig = {
  loginRequired: true,
};

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = sessionStorage.getItem("admin") === "true";
  const username = sessionStorage.getItem("username");

  // Por un comportamiento de Hilla con el file-router, /login a veces queda
  // igual envuelto por este layout aunque login.tsx tenga skipLayouts: true.
  // En vez de depender de que eso se resuelva solo, lo chequeamos a mano:
  // si la ruta actual es /login, el layout no debe hacer nada (ni guard,
  // ni menú) — simplemente deja pasar el Outlet (el LoginView).
  const isLoginRoute = location.pathname === "/login";

  // Guard: si no hay sesión Y no estamos en /login, redirigir a /login.
  // Usamos navigate() (navegación de React) en vez de window.location.href
  // para no forzar una recarga completa del navegador — eso fue lo que
  // generaba el loop infinito cuando /login quedaba envuelto en el layout.
  useEffect(() => {
    if (!isLoginRoute && !username) {
      navigate("/login", { replace: true });
    }
  }, [username, isLoginRoute, location.pathname]);

  // En /login: renderizar solo el Outlet, sin menú ni guard.
  if (isLoginRoute) {
    return <Outlet />;
  }

  // En cualquier otra ruta sin sesión: no mostrar nada mientras se redirige.
  if (!username) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await UsuarioService.logout();
    } catch {
      // Si falla la llamada (ej. ya no hay sesión), no importa:
      // de cualquier forma vamos a limpiar el lado del cliente.
    }
    sessionStorage.clear();
    window.location.href = "/login";
  };

  const linkStyle = ({
    isActive,
  }: {
    isActive: boolean;
  }): React.CSSProperties => ({
    display: "block",
    padding: "0.5rem 0.75rem",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "0.9rem",
    color: isActive ? "#fff" : "#334155",
    background: isActive ? "#2563eb" : "transparent",
    transition: "background 0.15s, color 0.15s",
  });

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <nav
        style={{
          width: "220px",
          background: "#f8fafc",
          borderRight: "1px solid #e2e8f0",
          padding: "1.25rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem",
          flexShrink: 0,
        }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "#94a3b8",
              textTransform: "uppercase",
              marginBottom: "0.25rem",
            }}
          >
            Sistema UTN
          </div>
          <div
            style={{ fontSize: "0.85rem", color: "#475569", fontWeight: 500 }}
          >
            {username}
          </div>
          {isAdmin && (
            <span
              style={{
                fontSize: "0.7rem",
                background: "#dbeafe",
                color: "#1d4ed8",
                borderRadius: "4px",
                padding: "1px 6px",
                fontWeight: 600,
              }}
            >
              Admin
            </span>
          )}
        </div>

        <div
          style={{
            height: "1px",
            background: "#e2e8f0",
            margin: "0.25rem 0 0.5rem",
          }}
        />

        <NavLink to="/" end style={linkStyle}>
          🏛 Facultades
        </NavLink>
        <NavLink to="/terceros" style={linkStyle}>
          👥 Terceros
        </NavLink>
        <NavLink to="/facturas" style={linkStyle}>
          🧾 Facturas
        </NavLink>
        <NavLink to="/pagos" style={linkStyle}>
          💳 Pagos
        </NavLink>
        {isAdmin && (
          <NavLink to="/usuarios" style={linkStyle}>
            ⚙️ Usuarios
          </NavLink>
        )}

        <div style={{ flex: 1 }} />
        <div
          style={{ height: "1px", background: "#e2e8f0", margin: "0.5rem 0" }}
        />
        <button
          onClick={handleLogout}
          style={{
            padding: "0.5rem 0.75rem",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
            background: "#fff",
            color: "#64748b",
            cursor: "pointer",
            fontSize: "0.85rem",
            textAlign: "left",
          }}
        >
          Cerrar sesión
        </button>
      </nav>

      <main style={{ flex: 1, overflow: "auto", background: "#f1f5f9" }}>
        <Outlet />
      </main>
    </div>
  );
}
