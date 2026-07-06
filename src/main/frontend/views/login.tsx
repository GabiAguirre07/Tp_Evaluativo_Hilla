import { ViewConfig } from "@vaadin/hilla-file-router/types.js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UsuarioService } from "Frontend/generated/endpoints.js";

export const config: ViewConfig = {
  menu: { exclude: true },
  loginRequired: false,
  skipLayouts: true,
};

export default function LoginView() {
  const [tab, setTab] = useState<"login" | "registro">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setMensaje("Completá todos los campos.");
      return;
    }
    setLoading(true);
    setMensaje("");
    try {
      const usuario = await UsuarioService.login(username, password);
      if (usuario) {
        sessionStorage.setItem("username", usuario.username ?? "");
        sessionStorage.setItem("admin", String(usuario.admin ?? false));
        navigate("/");
      } else {
        setMensaje("Usuario o contraseña incorrectos.");
      }
    } catch {
      setMensaje("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegistro = async () => {
    if (!username || !correo || !password) {
      setMensaje("Completá todos los campos.");
      return;
    }
    setLoading(true);
    setMensaje("");
    try {
      const ok = await UsuarioService.registrar(username, correo, password);
      if (ok) {
        setMensaje("✓ Cuenta creada. Ya podés ingresar.");
        setTab("login");
      } else {
        setMensaje("El usuario o correo ya existe.");
      }
    } catch {
      setMensaje("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    padding: "0.6rem 0.75rem",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "0.9rem",
    outline: "none",
    fontFamily: "inherit",
  };

  const btnPrimary: React.CSSProperties = {
    padding: "0.65rem",
    borderRadius: "6px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.7 : 1,
    fontFamily: "inherit",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#f1f5f9",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          padding: "2rem",
          width: "340px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
        }}
      >
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
          UTN FRP
        </div>
        <h2
          style={{
            margin: "0 0 1.5rem",
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          Sistema de Pagos
        </h2>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {(["login", "registro"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setMensaje("");
              }}
              style={{
                flex: 1,
                padding: "0.45rem",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                cursor: "pointer",
                background: tab === t ? "#2563eb" : "#fff",
                color: tab === t ? "#fff" : "#64748b",
                fontWeight: 600,
                fontSize: "0.82rem",
                fontFamily: "inherit",
              }}
            >
              {t === "login" ? "Iniciar sesión" : "Registrarse"}
            </button>
          ))}
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}
        >
          <input
            style={inputStyle}
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && tab === "login" && handleLogin()
            }
          />

          {tab === "registro" && (
            <input
              style={inputStyle}
              placeholder="Correo electrónico"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          )}

          <input
            style={inputStyle}
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && tab === "login" && handleLogin()
            }
          />

          <button
            style={btnPrimary}
            disabled={loading}
            onClick={tab === "login" ? handleLogin : handleRegistro}
          >
            {loading
              ? "Cargando..."
              : tab === "login"
                ? "Ingresar"
                : "Crear cuenta"}
          </button>

          {mensaje && (
            <p
              style={{
                margin: 0,
                fontSize: "0.82rem",
                padding: "0.5rem 0.75rem",
                borderRadius: "6px",
                background: mensaje.startsWith("✓") ? "#f0fdf4" : "#fef2f2",
                color: mensaje.startsWith("✓") ? "#166534" : "#dc2626",
                border: `1px solid ${mensaje.startsWith("✓") ? "#bbf7d0" : "#fecaca"}`,
              }}
            >
              {mensaje}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
