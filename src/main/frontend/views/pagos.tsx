import { ViewConfig } from "@vaadin/hilla-file-router/types.js";
import React, { useState, useEffect, useRef } from "react";
import { PagosService, TercerosService } from "Frontend/generated/endpoints.js";
import type Pagos from "Frontend/generated/utn/frp/comp03/terceros/model/Pagos.js";
import type Terceros from "Frontend/generated/utn/frp/comp03/terceros/model/Terceros.js";

export const config: ViewConfig = {
  loginRequired: true,
};

const emptyDetalle = () => ({
  id: undefined,
  instrumentNumber: "",
  instrumentDate: undefined,
  banco: "",
  pagoRealizado: false,
  pago: undefined,
  idPago: undefined,
});

const emptyForm = (): Pagos => ({
  id: undefined,
  tercero: undefined,
  fechaPago: undefined,
  montoPago: undefined,
  modoPago: "",
  detalle: emptyDetalle() as any,
});

const MODOS_PAGO = ["Efectivo", "Cheque", "Transferencia", "Tarjeta"];

export default function PagosView() {
  const isAdmin = sessionStorage.getItem("admin") === "true";
  const [lista, setLista] = useState<Pagos[]>([]);
  const [terceros, setTerceros] = useState<Terceros[]>([]);
  const [filtro, setFiltro] = useState("");
  const [sugerencias, setSugerencias] = useState<Pagos[]>([]);
  const [mostrarSug, setMostrarSug] = useState(false);
  const [filtroTercero, setFiltroTercero] = useState("");
  const [sugTerceros, setSugTerceros] = useState<Terceros[]>([]);
  const [mostrarSugT, setMostrarSugT] = useState(false);
  const [form, setForm] = useState<Pagos>(emptyForm());
  const [editando, setEditando] = useState(false);
  const [expandidoId, setExpandidoId] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  const [confirmMsg, setConfirmMsg] = useState("");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const terceroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cargar();
    cargarTerceros();
  }, []);

  useEffect(() => {
    if (filtro.trim() === "") {
      setSugerencias([]);
      return;
    }
    const f = filtro.toLowerCase();
    setSugerencias(
      lista
        .filter(
          (p) =>
            p.tercero?.nombre?.toLowerCase().includes(f) ||
            p.modoPago?.toLowerCase().includes(f) ||
            String(p.montoPago).includes(f),
        )
        .slice(0, 6),
    );
  }, [filtro, lista]);

  useEffect(() => {
    if (filtroTercero.trim() === "") {
      setSugTerceros([]);
      return;
    }
    const f = filtroTercero.toLowerCase();
    setSugTerceros(
      terceros.filter((t) => t.nombre?.toLowerCase().includes(f)).slice(0, 6),
    );
  }, [filtroTercero, terceros]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setMostrarSug(false);
      if (terceroRef.current && !terceroRef.current.contains(e.target as Node))
        setMostrarSugT(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const cargar = async () => {
    const lista = await PagosService.list();
    setLista(lista ?? []);
  };

  const cargarTerceros = async () => {
    const lista = await TercerosService.list();
    setTerceros(lista ?? []);
  };

  const seleccionarForm = (p: Pagos) => {
    setForm({ ...p, detalle: p.detalle ?? (emptyDetalle() as any) });
    setEditando(true);
    setFiltro(`${p.tercero?.nombre ?? ""} — $${p.montoPago}`);
    setFiltroTercero(p.tercero?.nombre ?? "");
    setMostrarSug(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleExpandir = (id: number | undefined) => {
    if (id == null) return;
    setExpandidoId((prev) => (prev === id ? null : id));
  };

  const limpiar = () => {
    setForm(emptyForm());
    setEditando(false);
    setFiltro("");
    setFiltroTercero("");
  };

  const guardar = async () => {
    await PagosService.save(form);
    showToast(editando ? "Pago actualizado." : "Pago creado.");
    limpiar();
    cargar();
  };

  const eliminar = async () => {
    if (!form.id) return;
    setConfirmMsg("¿Eliminar este pago?");
    setPendingAction(() => async () => {
      await PagosService.delete(form.id!);
      showToast("Pago eliminado.");
      limpiar();
      cargar();
    });
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };
  const set = (k: keyof Pagos, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const setDet = (k: string, v: any) =>
    setForm((f) => ({ ...f, detalle: { ...(f.detalle as any), [k]: v } }));

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
        <div style={eyebrow}>Gestión</div>
        <h1 style={h1}>Pagos</h1>
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
          placeholder="Buscar por tercero, monto o modo…"
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
                onClick={() => seleccionarForm(s)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f1f5f9")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#fff")
                }
              >
                <strong>{s.tercero?.nombre}</strong>
                <span
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.78rem",
                    marginLeft: "0.5rem",
                  }}
                >
                  ${s.montoPago} — {s.modoPago} —{" "}
                  {s.fechaPago ? String(s.fechaPago) : ""}
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
            {editando ? `Editando pago #${form.id}` : "Nuevo Pago"}
          </span>
          {editando && (
            <button style={btnGhost} onClick={limpiar}>
              + Nuevo
            </button>
          )}
        </div>

        <div style={grid2}>
          <Field
            label="Fecha de pago"
            type="date"
            value={form.fechaPago ? String(form.fechaPago) : ""}
            onChange={(v) => set("fechaPago", v)}
            disabled={!isAdmin}
          />
          <Field
            label="Monto"
            type="number"
            value={String(form.montoPago ?? "")}
            onChange={(v) => set("montoPago", Number(v))}
            disabled={!isAdmin}
          />
        </div>

        {/* Modo de pago */}
        <div style={{ padding: "0.85rem 1.25rem 0" }}>
          <label style={labelStyle}>Modo de pago</label>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginTop: "0.3rem",
              flexWrap: "wrap",
            }}
          >
            {MODOS_PAGO.map((m) => (
              <button
                key={m}
                disabled={!isAdmin}
                onClick={() => set("modoPago", m)}
                style={{
                  padding: "0.35rem 0.85rem",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  border: "1px solid",
                  borderColor: form.modoPago === m ? "#2563eb" : "#e2e8f0",
                  background: form.modoPago === m ? "#dbeafe" : "#f8fafc",
                  color: form.modoPago === m ? "#1d4ed8" : "#64748b",
                  fontWeight: form.modoPago === m ? 700 : 400,
                  cursor: isAdmin ? "pointer" : "not-allowed",
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Selector tercero */}
        <div style={{ padding: "0.85rem 1.25rem 0" }}>
          <label style={labelStyle}>Tercero</label>
          <div
            ref={terceroRef}
            style={{
              position: "relative",
              maxWidth: "400px",
              marginTop: "0.3rem",
            }}
          >
            <input
              style={{
                ...fieldInput(!isAdmin),
                width: "100%",
                boxSizing: "border-box" as const,
              }}
              disabled={!isAdmin}
              placeholder="Buscar tercero…"
              value={filtroTercero}
              onChange={(e) => {
                setFiltroTercero(e.target.value);
                setMostrarSugT(true);
              }}
              onFocus={() => setMostrarSugT(true)}
            />
            {mostrarSugT && sugTerceros.length > 0 && (
              <div style={dropdownStyle}>
                {sugTerceros.map((t) => (
                  <div
                    key={t.id}
                    style={dropItem}
                    onClick={() => {
                      set("tercero", t);
                      setFiltroTercero(t.nombre ?? "");
                      setMostrarSugT(false);
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f1f5f9")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#fff")
                    }
                  >
                    <strong>{t.nombre}</strong>
                    <span
                      style={{
                        color: "#94a3b8",
                        fontSize: "0.78rem",
                        marginLeft: "0.5rem",
                      }}
                    >
                      {t.cuitl}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {form.tercero && (
            <div
              style={{
                marginTop: "0.4rem",
                fontSize: "0.78rem",
                color: "#2563eb",
              }}
            >
              ✓ {form.tercero.nombre}
            </div>
          )}
        </div>

        {/* Detalle del pago */}
        <div style={{ padding: "0.85rem 1.25rem 0" }}>
          <label
            style={{ ...labelStyle, display: "block", marginBottom: "0.5rem" }}
          >
            Detalle
          </label>
          <div style={grid2}>
            <Field
              label="Número instrumento"
              value={(form.detalle as any)?.instrumentNumber ?? ""}
              onChange={(v) => setDet("instrumentNumber", v)}
              disabled={!isAdmin}
            />
            <Field
              label="Fecha instrumento"
              type="date"
              value={
                (form.detalle as any)?.instrumentDate
                  ? String((form.detalle as any).instrumentDate)
                  : ""
              }
              onChange={(v) => setDet("instrumentDate", v)}
              disabled={!isAdmin}
            />
            <Field
              label="Banco"
              value={(form.detalle as any)?.banco ?? ""}
              onChange={(v) => setDet("banco", v)}
              disabled={!isAdmin}
            />
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                paddingBottom: "0.1rem",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.875rem",
                  color: "#475569",
                  cursor: isAdmin ? "pointer" : "not-allowed",
                }}
              >
                <input
                  type="checkbox"
                  checked={(form.detalle as any)?.pagoRealizado ?? false}
                  disabled={!isAdmin}
                  onChange={(e) => setDet("pagoRealizado", e.target.checked)}
                />
                Pago realizado
              </label>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div style={btnRow}>
            <button style={btnPrimary} onClick={guardar}>
              {editando ? "Guardar cambios" : "Crear pago"}
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

      {/* Tabla con detalle expandible inline */}
      <div style={card}>
        <div style={cardHeader}>
          <span style={{ fontWeight: 600 }}>Todos los pagos</span>
        </div>
        <table style={tableStyle}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th style={th}></th>
              {["Tercero", "Fecha", "Monto", "Modo", "Realizado"].map((h) => (
                <th key={h} style={th}>
                  {h}
                </th>
              ))}
              {isAdmin && <th style={th}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 && (
              <tr>
                <td
                  colSpan={7}
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
            {lista.map((p) => (
              <React.Fragment key={p.id}>
                <tr
                  style={{ cursor: "pointer", transition: "background 0.1s" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f8fafc")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      expandidoId === p.id ? "#f0f7ff" : "transparent")
                  }
                >
                  <td
                    style={{ ...td, width: "32px", textAlign: "center" }}
                    onClick={() => toggleExpandir(p.id as number)}
                  >
                    <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                      {expandidoId === p.id ? "▼" : "▶"}
                    </span>
                  </td>
                  <td style={td} onClick={() => toggleExpandir(p.id as number)}>
                    {p.tercero?.nombre ?? "—"}
                  </td>
                  <td style={td} onClick={() => toggleExpandir(p.id as number)}>
                    {p.fechaPago ? String(p.fechaPago) : "—"}
                  </td>
                  <td
                    style={{ ...td, fontWeight: 600 }}
                    onClick={() => toggleExpandir(p.id as number)}
                  >
                    ${p.montoPago?.toFixed(2) ?? "—"}
                  </td>
                  <td style={td} onClick={() => toggleExpandir(p.id as number)}>
                    {p.modoPago ? (
                      <span
                        style={{
                          background: "#f1f5f9",
                          borderRadius: "4px",
                          padding: "2px 7px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                        }}
                      >
                        {p.modoPago}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={td} onClick={() => toggleExpandir(p.id as number)}>
                    {(p.detalle as any)?.pagoRealizado ? (
                      <span style={{ color: "#16a34a", fontWeight: 700 }}>
                        ✓ Sí
                      </span>
                    ) : (
                      <span style={{ color: "#94a3b8" }}>—</span>
                    )}
                  </td>
                  {isAdmin && (
                    <td style={td}>
                      <button
                        style={btnGhost}
                        onClick={() => seleccionarForm(p)}
                      >
                        Editar
                      </button>
                    </td>
                  )}
                </tr>

                {/* Panel expandible de detalle */}
                {expandidoId === p.id && (
                  <tr>
                    <td
                      colSpan={isAdmin ? 7 : 6}
                      style={{
                        padding: 0,
                        background: "#f8fafc",
                        borderBottom: "2px solid #e2e8f0",
                      }}
                    >
                      <div style={{ padding: "0.75rem 1.5rem 1rem" }}>
                        <div
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            color: "#64748b",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            marginBottom: "0.75rem",
                          }}
                        >
                          Detalle del pago
                        </div>
                        {!(p.detalle as any) ? (
                          <p
                            style={{
                              color: "#94a3b8",
                              fontSize: "0.82rem",
                              margin: 0,
                            }}
                          >
                            Sin detalle registrado.
                          </p>
                        ) : (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(4, 1fr)",
                              gap: "1rem",
                            }}
                          >
                            <DetalleField
                              label="Nº Instrumento"
                              value={
                                (p.detalle as any)?.instrumentNumber || "—"
                              }
                            />
                            <DetalleField
                              label="Fecha instrumento"
                              value={
                                (p.detalle as any)?.instrumentDate
                                  ? String((p.detalle as any).instrumentDate)
                                  : "—"
                              }
                            />
                            <DetalleField
                              label="Banco"
                              value={(p.detalle as any)?.banco || "—"}
                            />
                            <div>
                              <div
                                style={{
                                  fontSize: "0.72rem",
                                  fontWeight: 700,
                                  color: "#94a3b8",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                  marginBottom: "0.25rem",
                                }}
                              >
                                Estado
                              </div>
                              <span
                                style={{
                                  fontSize: "0.82rem",
                                  fontWeight: 600,
                                  padding: "3px 10px",
                                  borderRadius: "4px",
                                  background: (p.detalle as any)?.pagoRealizado
                                    ? "#dcfce7"
                                    : "#fef9c3",
                                  color: (p.detalle as any)?.pagoRealizado
                                    ? "#166534"
                                    : "#854d0e",
                                }}
                              >
                                {(p.detalle as any)?.pagoRealizado
                                  ? "Realizado"
                                  : "Pendiente"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DetalleField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: "0.72rem",
          fontWeight: 700,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "0.25rem",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "0.875rem", color: "#334155", fontWeight: 500 }}>
        {value}
      </div>
    </div>
  );
}

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
      <label style={labelStyle}>{label}</label>
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
      }}
    >
      {msg}
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  padding: "2rem",
  maxWidth: "980px",
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
const labelStyle: React.CSSProperties = {
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
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
