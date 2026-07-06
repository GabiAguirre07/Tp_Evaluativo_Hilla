import { ViewConfig } from "@vaadin/hilla-file-router/types.js";
import React, { useState, useEffect, useRef } from "react";
import { FacultadService } from "Frontend/generated/endpoints.js";
import type Facultad from "Frontend/generated/utn/frp/comp03/terceros/model/Facultad.js";

export const config: ViewConfig = {
  loginRequired: true,
};

const empty = (): Facultad => ({
  id: undefined,
  nombre: "",
  direccion: "",
  cuit: "",
  sucursal: undefined,
  telefonos: "",
  correo: "",
  defecto: false,
});

export default function FacultadView() {
  const isAdmin = sessionStorage.getItem("admin") === "true";
  const [lista, setLista] = useState<Facultad[]>([]);
  const [filtro, setFiltro] = useState("");
  const [sugerencias, setSugerencias] = useState<Facultad[]>([]);
  const [mostrarSug, setMostrarSug] = useState(false);
  const [form, setForm] = useState<Facultad>(empty());
  const [editando, setEditando] = useState(false);
  const [toast, setToast] = useState("");
  const [confirmMsg, setConfirmMsg] = useState("");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cargar();
  }, []);

  useEffect(() => {
    if (filtro.trim() === "") {
      setSugerencias([]);
      return;
    }
    const f = filtro.toLowerCase();
    setSugerencias(
      lista.filter((x) => x.nombre?.toLowerCase().includes(f)).slice(0, 6),
    );
  }, [filtro, lista]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setMostrarSug(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const cargar = async () => {
    const lista = await FacultadService.list();
    setLista(lista ?? []);
  };

  const seleccionar = (f: Facultad) => {
    setForm({ ...f });
    setEditando(true);
    setFiltro(f.nombre ?? "");
    setMostrarSug(false);
  };

  const limpiar = () => {
    setForm(empty());
    setEditando(false);
    setFiltro("");
  };

  const guardar = async () => {
    await FacultadService.save(form);
    showToast(editando ? "Facultad actualizada." : "Facultad creada.");
    limpiar();
    cargar();
  };

  const eliminar = async () => {
    if (!form.id) return;
    setConfirmMsg("¿Eliminar esta facultad?");
    setPendingAction(() => async () => {
      await FacultadService.delete(form.id!);
      showToast("Facultad eliminada.");
      limpiar();
      cargar();
    });
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const set = (k: keyof Facultad, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div style={pageStyle}>
      {toast && <Toast msg={toast} />}
      {confirmMsg && (
        <ConfirmModal
          msg={confirmMsg}
          onConfirm={async () => {
            setConfirmMsg("");
            if (pendingAction) await pendingAction();
            setPendingAction(null);
          }}
          onCancel={() => {
            setConfirmMsg("");
            setPendingAction(null);
          }}
        />
      )}
      <header style={headerStyle}>
        <div>
          <div style={eyebrow}>Gestión</div>
          <h1 style={h1}>Facultades</h1>
        </div>
      </header>

      {/* Buscador */}
      <div
        ref={searchRef}
        style={{
          position: "relative",
          maxWidth: "400px",
          marginBottom: "1.5rem",
        }}
      >
        <input
          style={searchInput}
          placeholder="Buscar facultad por nombre…"
          value={filtro}
          onChange={(e) => {
            setFiltro(e.target.value);
            setMostrarSug(true);
          }}
          onFocus={() => setMostrarSug(true)}
        />
        {mostrarSug && sugerencias.length > 0 && (
          <div style={dropdownStyle}>
            {sugerencias.map((s) => (
              <div
                key={s.id}
                style={dropItem}
                onClick={() => seleccionar(s)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f1f5f9")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#fff")
                }
              >
                <strong>{s.nombre}</strong>
                <span
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.78rem",
                    marginLeft: "0.5rem",
                  }}
                >
                  {s.cuit}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulario */}
      <div style={card}>
        <div style={cardHeader}>
          <span style={{ fontWeight: 600, color: "#0f172a" }}>
            {editando ? `Editando: ${form.nombre}` : "Nueva Facultad"}
          </span>
          {editando && (
            <button style={btnGhost} onClick={limpiar}>
              + Nueva
            </button>
          )}
        </div>

        <div style={grid2}>
          <Field
            label="Nombre"
            value={form.nombre ?? ""}
            onChange={(v) => set("nombre", v)}
            disabled={!isAdmin}
          />
          <Field
            label="CUIT"
            value={form.cuit ?? ""}
            onChange={(v) => set("cuit", v)}
            disabled={!isAdmin}
          />
          <Field
            label="Dirección"
            value={form.direccion ?? ""}
            onChange={(v) => set("direccion", v)}
            disabled={!isAdmin}
          />
          <Field
            label="Sucursal"
            type="number"
            value={String(form.sucursal ?? "")}
            onChange={(v) => set("sucursal", Number(v))}
            disabled={!isAdmin}
          />
          <Field
            label="Teléfonos"
            value={form.telefonos ?? ""}
            onChange={(v) => set("telefonos", v)}
            disabled={!isAdmin}
          />
          <Field
            label="Correo"
            type="email"
            value={form.correo ?? ""}
            onChange={(v) => set("correo", v)}
            disabled={!isAdmin}
          />
        </div>

        <label style={checkLabel}>
          <input
            type="checkbox"
            checked={form.defecto ?? false}
            onChange={(e) => set("defecto", e.target.checked)}
            disabled={!isAdmin}
          />
          <span style={{ marginLeft: "0.4rem" }}>Facultad por defecto</span>
        </label>

        {isAdmin && (
          <div style={btnRow}>
            <button style={btnPrimary} onClick={guardar}>
              {editando ? "Guardar cambios" : "Crear facultad"}
            </button>
            {editando && (
              <button style={btnDanger} onClick={eliminar}>
                Eliminar
              </button>
            )}
          </div>
        )}
        {!isAdmin && (
          <p style={readonlyNote}>
            Solo visualización — no tenés permisos de edición.
          </p>
        )}
      </div>

      {/* Tabla */}
      <div style={card}>
        <div style={cardHeader}>
          <span style={{ fontWeight: 600 }}>Todas las facultades</span>
        </div>
        <table style={tableStyle}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Nombre", "CUIT", "Dirección", "Sucursal", "Defecto"].map(
                (h) => (
                  <th key={h} style={th}>
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "#94a3b8",
                  }}
                >
                  Sin registros
                </td>
              </tr>
            )}
            {lista.map((f) => (
              <tr
                key={f.id}
                style={trStyle}
                onClick={() => seleccionar(f)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f8fafc")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <td style={td}>{f.nombre}</td>
                <td style={td}>{f.cuit}</td>
                <td style={td}>{f.direccion}</td>
                <td style={td}>{f.sucursal}</td>
                <td style={td}>{f.defecto ? "✓" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ConfirmModal({
  msg,
  onConfirm,
  onCancel,
}: {
  msg: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <p
          style={{
            margin: "0 0 1.25rem",
            fontSize: "0.95rem",
            color: "#0f172a",
            fontWeight: 500,
          }}
        >
          {msg}
        </p>
        <div
          style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}
        >
          <button style={btnGhost} onClick={onCancel}>
            Cancelar
          </button>
          <button style={btnDanger} onClick={onConfirm}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Shared sub-components ────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <label
        style={{
          fontSize: "0.78rem",
          fontWeight: 600,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        style={fieldInput(disabled)}
      />
    </div>
  );
}

function Toast({ msg }: { msg: string }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        background: "#0f172a",
        color: "#fff",
        padding: "0.75rem 1.25rem",
        borderRadius: "8px",
        fontSize: "0.85rem",
        fontWeight: 500,
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        zIndex: 999,
        animation: "fadeIn 0.2s ease",
      }}
    >
      {msg}
    </div>
  );
}

// ── Shared styles ────────────────────────────────────────────────────
const pageStyle: React.CSSProperties = {
  padding: "2rem",
  maxWidth: "960px",
  margin: "0 auto",
};
const headerStyle: React.CSSProperties = { marginBottom: "1.5rem" };
const eyebrow: React.CSSProperties = {
  fontSize: "0.7rem",
  fontWeight: 700,
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};
const h1: React.CSSProperties = {
  margin: 0,
  fontSize: "1.6rem",
  fontWeight: 800,
  color: "#0f172a",
};
const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  marginBottom: "1.25rem",
  overflow: "hidden",
};
const cardHeader: React.CSSProperties = {
  padding: "0.85rem 1.25rem",
  borderBottom: "1px solid #e2e8f0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#f8fafc",
};
const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0.85rem",
  padding: "1.25rem 1.25rem 0",
};
const btnRow: React.CSSProperties = {
  display: "flex",
  gap: "0.5rem",
  padding: "1rem 1.25rem 1.25rem",
};
const btnPrimary: React.CSSProperties = {
  padding: "0.55rem 1.25rem",
  borderRadius: "6px",
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "0.875rem",
};
const btnDanger: React.CSSProperties = {
  padding: "0.55rem 1.25rem",
  borderRadius: "6px",
  border: "1px solid #fecaca",
  background: "#fef2f2",
  color: "#dc2626",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "0.875rem",
};
const btnGhost: React.CSSProperties = {
  padding: "0.35rem 0.85rem",
  borderRadius: "6px",
  border: "1px solid #e2e8f0",
  background: "#fff",
  color: "#2563eb",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "0.8rem",
};
const checkLabel: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  fontSize: "0.875rem",
  color: "#475569",
  padding: "0.75rem 1.25rem 0",
  cursor: "pointer",
};
const readonlyNote: React.CSSProperties = {
  margin: "0.75rem 1.25rem 1.25rem",
  fontSize: "0.82rem",
  color: "#94a3b8",
};
const searchInput: React.CSSProperties = {
  width: "100%",
  padding: "0.6rem 0.9rem",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "0.9rem",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};
const dropdownStyle: React.CSSProperties = {
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
  zIndex: 50,
  marginTop: "4px",
  overflow: "hidden",
};
const dropItem: React.CSSProperties = {
  padding: "0.6rem 0.9rem",
  cursor: "pointer",
  fontSize: "0.875rem",
  transition: "background 0.1s",
};
const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.875rem",
};
const th: React.CSSProperties = {
  padding: "0.6rem 1rem",
  textAlign: "left",
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBottom: "1px solid #e2e8f0",
};
const td: React.CSSProperties = {
  padding: "0.7rem 1rem",
  borderBottom: "1px solid #f1f5f9",
  color: "#334155",
};
const trStyle: React.CSSProperties = {
  cursor: "pointer",
  transition: "background 0.1s",
};
const fieldInput = (disabled: boolean): React.CSSProperties => ({
  padding: "0.55rem 0.75rem",
  borderRadius: "6px",
  border: "1px solid #e2e8f0",
  fontSize: "0.875rem",
  background: disabled ? "#f8fafc" : "#fff",
  color: disabled ? "#94a3b8" : "#0f172a",
  outline: "none",
  fontFamily: "inherit",
});
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};
const modalStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "12px",
  padding: "1.5rem 1.75rem",
  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
  minWidth: "300px",
  maxWidth: "420px",
};
