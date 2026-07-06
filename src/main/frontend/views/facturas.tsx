import { ViewConfig } from "@vaadin/hilla-file-router/types.js";
import {
  FacturasService,
  TercerosService,
} from "Frontend/generated/endpoints.js";
import type Facturas from "Frontend/generated/utn/frp/comp03/terceros/model/Facturas.js";
import type Facturas_Items from "Frontend/generated/utn/frp/comp03/terceros/model/Facturas_Items.js";
import type Terceros from "Frontend/generated/utn/frp/comp03/terceros/model/Terceros.js";
import React from "react";
import { useState, useEffect, useRef } from "react";

export const config: ViewConfig = {
  loginRequired: true,
};

const emptyItem = (): Facturas_Items => ({
  id: undefined,
  monto: undefined,
  cantidad: undefined,
  detalle: "",
  factura: undefined,
});
const emptyForm = (): Facturas => ({
  id: undefined,
  fechaFactura: undefined,
  numero: undefined,
  tercero: undefined,
  items: [],
});

export default function FacturasView() {
  const isAdmin = sessionStorage.getItem("admin") === "true";
  const [lista, setLista] = useState<Facturas[]>([]);
  const [terceros, setTerceros] = useState<Terceros[]>([]);
  const [filtro, setFiltro] = useState("");
  const [sugerencias, setSugerencias] = useState<Facturas[]>([]);
  const [mostrarSug, setMostrarSug] = useState(false);
  const [filtroTercero, setFiltroTercero] = useState("");
  const [sugTerceros, setSugTerceros] = useState<Terceros[]>([]);
  const [mostrarSugT, setMostrarSugT] = useState(false);
  const [form, setForm] = useState<Facturas>(emptyForm());
  const [editando, setEditando] = useState(false);
  const [expandidoId, setExpandidoId] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  const [toastError, setToastError] = useState("");
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
          (x) =>
            String(x.numero).includes(f) ||
            x.tercero?.nombre?.toLowerCase().includes(f),
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
    const lista = await FacturasService.list();
    setLista(lista ?? []);
  };

  const cargarTerceros = async () => {
    const lista = await TercerosService.list();
    setTerceros(lista ?? []);
  };

  const seleccionarForm = (f: Facturas) => {
    setForm({ ...f, items: f.items ? [...f.items] : [] });
    setEditando(true);
    setFiltro(`Nº ${f.numero} — ${f.tercero?.nombre ?? ""}`);
    setFiltroTercero(f.tercero?.nombre ?? "");
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
    try {
      await FacturasService.save(form);
      showToast(editando ? "Factura actualizada." : "Factura creada.");
      limpiar();
      cargar();
    } catch (e: any) {
      const raw = e?.message ?? e?.toString() ?? "";
      const match =
        raw.match(/IllegalStateException[:\s]+(.+)/s) ??
        raw.match(/message["\s:]+(.+?)["}\n]/s);
      const texto = match
        ? match[1].trim()
        : "No se pudo guardar la factura. Verificá los datos e intentá de nuevo.";
      showToastError(texto);
    }
  };

  const eliminar = async () => {
    if (!form.id) return;
    setConfirmMsg("¿Eliminar esta factura?");
    setPendingAction(() => async () => {
      await FacturasService.delete(form.id!);
      showToast("Factura eliminada.");
      limpiar();
      cargar();
    });
  };

  const agregarItem = () =>
    setForm((f) => ({ ...f, items: [...(f.items ?? []), emptyItem()] }));
  const updateItem = (idx: number, k: keyof Facturas_Items, v: any) =>
    setForm((f) => ({
      ...f,
      items: (f.items ?? []).map((it, i) =>
        i === idx ? { ...it, [k]: v } : it,
      ),
    }));
  const quitarItem = (idx: number) =>
    setForm((f) => ({
      ...f,
      items: (f.items ?? []).filter((_, i) => i !== idx),
    }));

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };
  const showToastError = (msg: string) => {
    setToastError(msg);
    setTimeout(() => setToastError(""), 5000);
  };
  const set = (k: keyof Facturas, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const totalFactura = (f: Facturas) =>
    (f.items ?? []).reduce(
      (s, it) => s + (it.monto ?? 0) * (it.cantidad ?? 1),
      0,
    );

  return (
    <div style={pageStyle}>
      {toast && <Toast msg={toast} />}
      {toastError && <ToastError msg={toastError} />}
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
        <h1 style={h1}>Facturas</h1>
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
          placeholder="Buscar por número o tercero…"
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
                <strong>Nº {s.numero}</strong>
                <span
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.78rem",
                    marginLeft: "0.5rem",
                  }}
                >
                  {s.tercero?.nombre} —{" "}
                  {s.fechaFactura ? String(s.fechaFactura) : ""}
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
            {editando ? `Editando Factura Nº ${form.numero}` : "Nueva Factura"}
          </span>
          {editando && (
            <button style={btnGhost} onClick={limpiar}>
              + Nueva
            </button>
          )}
        </div>

        <div style={grid2}>
          <Field
            label="Número"
            type="number"
            value={String(form.numero ?? "")}
            onChange={(v) => set("numero", Number(v))}
            disabled={!isAdmin}
          />
          <Field
            label="Fecha"
            type="date"
            value={form.fechaFactura ? String(form.fechaFactura) : ""}
            onChange={(v) => set("fechaFactura", v)}
            disabled={!isAdmin}
          />
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
              ✓ {form.tercero.nombre} — {form.tercero.cuitl}
            </div>
          )}
        </div>

        {/* Items */}
        <div style={{ padding: "1rem 1.25rem 0" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <label style={labelStyle}>Ítems</label>
            {isAdmin && (
              <button style={btnGhost} onClick={agregarItem}>
                + Agregar ítem
              </button>
            )}
          </div>

          {(form.items ?? []).length === 0 && (
            <p
              style={{
                color: "#94a3b8",
                fontSize: "0.82rem",
                margin: "0.5rem 0",
              }}
            >
              Sin ítems.{isAdmin ? " Agregá uno arriba." : ""}
            </p>
          )}

          {(form.items ?? []).map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 90px 90px auto",
                gap: "0.5rem",
                marginBottom: "0.5rem",
                alignItems: "end",
              }}
            >
              <div>
                <label style={labelStyle}>Detalle</label>
                <input
                  style={{
                    ...fieldInput(!isAdmin),
                    width: "100%",
                    boxSizing: "border-box" as const,
                  }}
                  value={item.detalle ?? ""}
                  disabled={!isAdmin}
                  onChange={(e) => updateItem(idx, "detalle", e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>Cantidad</label>
                <input
                  type="number"
                  style={fieldInput(!isAdmin)}
                  value={item.cantidad ?? ""}
                  disabled={!isAdmin}
                  onChange={(e) =>
                    updateItem(idx, "cantidad", Number(e.target.value))
                  }
                />
              </div>
              <div>
                <label style={labelStyle}>Monto</label>
                <input
                  type="number"
                  style={fieldInput(!isAdmin)}
                  value={item.monto ?? ""}
                  disabled={!isAdmin}
                  onChange={(e) =>
                    updateItem(idx, "monto", Number(e.target.value))
                  }
                />
              </div>
              {isAdmin && (
                <button
                  onClick={() => quitarItem(idx)}
                  style={{
                    padding: "0.35rem 0.6rem",
                    borderRadius: "6px",
                    border: "1px solid #fecaca",
                    background: "#fef2f2",
                    color: "#dc2626",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    alignSelf: "flex-end",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {(form.items ?? []).length > 0 && (
            <div
              style={{
                textAlign: "right",
                fontWeight: 700,
                color: "#0f172a",
                fontSize: "0.95rem",
                paddingTop: "0.5rem",
                borderTop: "1px solid #e2e8f0",
                marginTop: "0.25rem",
              }}
            >
              Total: ${totalFactura(form).toFixed(2)}
            </div>
          )}
        </div>

        {isAdmin && (
          <div style={btnRow}>
            <button style={btnPrimary} onClick={guardar}>
              {editando ? "Guardar cambios" : "Crear factura"}
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

      {/* Tabla con expansión inline */}
      <div style={card}>
        <div style={cardHeader}>
          <span style={{ fontWeight: 600 }}>Todas las facturas</span>
        </div>
        <table style={tableStyle}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th style={th}></th>
              {["Número", "Fecha", "Tercero", "Ítems", "Total"].map((h) => (
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
            {lista.map((f) => (
              <React.Fragment key={f.id}>
                <tr
                  style={{ cursor: "pointer", transition: "background 0.1s" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f8fafc")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      expandidoId === f.id ? "#f0f7ff" : "transparent")
                  }
                >
                  <td
                    style={{ ...td, width: "32px", textAlign: "center" }}
                    onClick={() => toggleExpandir(f.id as number)}
                  >
                    <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                      {expandidoId === f.id ? "▼" : "▶"}
                    </span>
                  </td>
                  <td style={td} onClick={() => toggleExpandir(f.id as number)}>
                    {f.numero}
                  </td>
                  <td style={td} onClick={() => toggleExpandir(f.id as number)}>
                    {f.fechaFactura ? String(f.fechaFactura) : "—"}
                  </td>
                  <td style={td} onClick={() => toggleExpandir(f.id as number)}>
                    {f.tercero?.nombre ?? "—"}
                  </td>
                  <td style={td} onClick={() => toggleExpandir(f.id as number)}>
                    <span
                      style={{
                        background: "#f1f5f9",
                        borderRadius: "4px",
                        padding: "2px 7px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                      }}
                    >
                      {f.items?.length ?? 0}
                    </span>
                  </td>
                  <td
                    style={{ ...td, fontWeight: 600 }}
                    onClick={() => toggleExpandir(f.id as number)}
                  >
                    ${totalFactura(f).toFixed(2)}
                  </td>
                  {isAdmin && (
                    <td style={td}>
                      <button
                        style={btnGhost}
                        onClick={() => seleccionarForm(f)}
                      >
                        Editar
                      </button>
                    </td>
                  )}
                </tr>

                {/* Panel expandible de ítems */}
                {expandidoId === f.id && (
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
                            marginBottom: "0.5rem",
                          }}
                        >
                          Ítems de la factura
                        </div>
                        {!f.items || f.items.length === 0 ? (
                          <p
                            style={{
                              color: "#94a3b8",
                              fontSize: "0.82rem",
                              margin: 0,
                            }}
                          >
                            Esta factura no tiene ítems.
                          </p>
                        ) : (
                          <table style={{ ...tableStyle, fontSize: "0.82rem" }}>
                            <thead>
                              <tr>
                                {[
                                  "Detalle",
                                  "Cantidad",
                                  "Monto unit.",
                                  "Subtotal",
                                ].map((h) => (
                                  <th
                                    key={h}
                                    style={{
                                      ...th,
                                      padding: "0.4rem 0.75rem",
                                      background: "transparent",
                                    }}
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {f.items.map((item, idx) => (
                                <tr key={item.id ?? idx}>
                                  <td
                                    style={{
                                      ...td,
                                      padding: "0.45rem 0.75rem",
                                    }}
                                  >
                                    {item.detalle || "—"}
                                  </td>
                                  <td
                                    style={{
                                      ...td,
                                      padding: "0.45rem 0.75rem",
                                    }}
                                  >
                                    {item.cantidad}
                                  </td>
                                  <td
                                    style={{
                                      ...td,
                                      padding: "0.45rem 0.75rem",
                                    }}
                                  >
                                    ${item.monto?.toFixed(2)}
                                  </td>
                                  <td
                                    style={{
                                      ...td,
                                      padding: "0.45rem 0.75rem",
                                      fontWeight: 600,
                                    }}
                                  >
                                    $
                                    {(
                                      (item.monto ?? 0) * (item.cantidad ?? 1)
                                    ).toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                              <tr>
                                <td
                                  colSpan={3}
                                  style={{
                                    ...td,
                                    textAlign: "right",
                                    fontWeight: 700,
                                    border: "none",
                                    paddingTop: "0.6rem",
                                  }}
                                >
                                  Total:
                                </td>
                                <td
                                  style={{
                                    ...td,
                                    fontWeight: 700,
                                    color: "#2563eb",
                                    border: "none",
                                    paddingTop: "0.6rem",
                                  }}
                                >
                                  ${totalFactura(f).toFixed(2)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
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

function ToastError({ msg }: { msg: string }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        background: "#fef2f2",
        color: "#dc2626",
        border: "1px solid #fecaca",
        padding: "0.75rem 1.25rem",
        borderRadius: "8px",
        fontSize: "0.85rem",
        fontWeight: 500,
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        zIndex: 999,
        maxWidth: "360px",
      }}
    >
      ⚠ {msg}
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
