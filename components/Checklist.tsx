"use client";

import { useMemo, useState } from "react";
import { checklist, constructora } from "@/lib/datos";
import type { ArchivoCargado, EstadoItem, RegistroItem } from "@/lib/tipos";
import { Filtros, type FiltroEstado } from "./checklist/Filtros";
import { Grupo } from "./checklist/Grupo";
import { Ingreso } from "./checklist/Ingreso";
import { ScoreEmpresa } from "./checklist/ScoreEmpresa";
import { Semaforo, type NivelRiesgo } from "./checklist/Semaforo";

const ITEMS = checklist.flatMap((g) => g.items);
const ITEMS_POR_ID = new Map(ITEMS.map((i) => [i.id, i]));
const CLAVES = ITEMS.filter((i) => i.clave);
const ALERTAS_EMPRESA = constructora.indicadores.filter((i) => i.listo && i.estado === "alerta").length;

function normalizar(texto: string) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function adivinarItem(nombre: string) {
  const n = normalizar(nombre);
  return ITEMS.find((i) => i.palabras.some((p) => n.includes(normalizar(p))))?.id ?? null;
}

export function Checklist() {
  const [registros, setRegistros] = useState<Record<string, RegistroItem>>({});
  const [archivos, setArchivos] = useState<ArchivoCargado[]>([]);
  const [abiertos, setAbiertos] = useState<Set<string>>(new Set([checklist[0].id]));
  const [filtro, setFiltro] = useState<FiltroEstado>("todos");
  const [soloClaves, setSoloClaves] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const estadoDe = (id: string): EstadoItem => registros[id]?.estado ?? "pendiente";

  function ingresar(itemId: string, archivo: string) {
    setRegistros((r) => ({ ...r, [itemId]: { estado: "verificando", archivo } }));
    const resultado: EstadoItem = ITEMS_POR_ID.get(itemId)?.observacion_demo ? "observado" : "verificado";
    window.setTimeout(() => {
      setRegistros((r) =>
        r[itemId]?.archivo === archivo && r[itemId].estado === "verificando"
          ? { ...r, [itemId]: { estado: resultado, archivo } }
          : r,
      );
    }, 1800);
  }

  function liberar(itemId: string, archivo: string) {
    setRegistros((r) => {
      if (r[itemId]?.archivo !== archivo) return r;
      const { [itemId]: _, ...resto } = r;
      return resto;
    });
  }

  function agregar(files: FileList, itemForzado?: string) {
    const nuevos = Array.from(files).map<ArchivoCargado>((f) => ({
      id: crypto.randomUUID(),
      nombre: f.name,
      peso: f.size,
      itemId: itemForzado ?? adivinarItem(f.name),
    }));
    setArchivos((a) => [
      ...a.map((x) => (itemForzado && x.itemId === itemForzado ? { ...x, itemId: null } : x)),
      ...nuevos,
    ]);
    nuevos.forEach((n) => n.itemId && ingresar(n.itemId, n.nombre));
  }

  function asignar(archivoId: string, itemId: string | null) {
    const archivo = archivos.find((a) => a.id === archivoId);
    if (!archivo) return;
    if (archivo.itemId) liberar(archivo.itemId, archivo.nombre);
    setArchivos((a) =>
      a.map((x) =>
        x.id === archivoId ? { ...x, itemId } : itemId && x.itemId === itemId ? { ...x, itemId: null } : x,
      ),
    );
    if (itemId) ingresar(itemId, archivo.nombre);
  }

  function quitar(archivoId: string) {
    const archivo = archivos.find((a) => a.id === archivoId);
    if (archivo?.itemId) liberar(archivo.itemId, archivo.nombre);
    setArchivos((a) => a.filter((x) => x.id !== archivoId));
  }

  function alternarGrupo(id: string) {
    setAbiertos((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  const conteos = useMemo(() => {
    const c: Record<FiltroEstado, number> = {
      todos: 0,
      pendiente: 0,
      verificando: 0,
      verificado: 0,
      observado: 0,
    };
    for (const i of ITEMS) {
      if (soloClaves && !i.clave) continue;
      c.todos++;
      c[registros[i.id]?.estado ?? "pendiente"]++;
    }
    return c;
  }, [registros, soloClaves]);

  const verificados = ITEMS.filter((i) => estadoDe(i.id) === "verificado").length;
  const observados = ITEMS.filter((i) => estadoDe(i.id) === "observado").length;
  const clavesPendientes = CLAVES.filter((i) => estadoDe(i.id) !== "verificado").length;
  const porcentaje = verificados / ITEMS.length;

  const nivel: NivelRiesgo =
    observados > 0 || clavesPendientes > CLAVES.length / 2
      ? "alto"
      : clavesPendientes === 0 && porcentaje >= 0.75
        ? "bajo"
        : "medio";

  const motivos = [
    clavesPendientes > 0 &&
      `${clavesPendientes} punto${clavesPendientes > 1 ? "s" : ""} clave sin verificar`,
    observados > 0 && `${observados} documento${observados > 1 ? "s" : ""} con observaciones`,
    ALERTAS_EMPRESA > 0 && `${ALERTAS_EMPRESA} alerta en el historial de la constructora`,
  ].filter((m): m is string => Boolean(m));

  const termino = normalizar(busqueda.trim());
  const filtroActivo = filtro !== "todos" || soloClaves || termino.length > 0;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex max-w-2xl flex-col gap-2">
        <p className="text-sm font-medium text-marron">Antes de invertir</p>
        <h1 className="text-balance text-3xl tracking-tight">Verificá antes de firmar</h1>
        <p className="text-pretty leading-relaxed text-muted">
          Cargá los documentos que te entregó la constructora. Cada punto pasa por ingreso y
          verificación, y el semáforo se actualiza según lo que esté cumplido.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-8">
          <Ingreso
            archivos={archivos}
            registros={registros}
            onAgregar={(f) => agregar(f)}
            onAsignar={asignar}
            onQuitar={quitar}
          />

          <section aria-labelledby="t-puntos" className="flex flex-col gap-4">
            <div>
              <h2 id="t-puntos" className="text-base">
                2. Lo que se te pide
              </h2>
              <p className="text-sm text-muted">Abrí cada sección para ver qué falta.</p>
            </div>
            <Filtros
              estado={filtro}
              onEstado={setFiltro}
              soloClaves={soloClaves}
              onSoloClaves={setSoloClaves}
              busqueda={busqueda}
              onBusqueda={setBusqueda}
              conteos={conteos}
            />
            <div className="flex flex-col gap-3">
              {checklist.map((grupo) => {
                const visibles = grupo.items.filter(
                  (i) =>
                    (filtro === "todos" || estadoDe(i.id) === filtro) &&
                    (!soloClaves || i.clave) &&
                    (!termino ||
                      normalizar(`${i.titulo} ${i.detalle} ${i.documento}`).includes(termino)),
                );
                if (filtroActivo && visibles.length === 0) return null;
                return (
                  <Grupo
                    key={grupo.id}
                    grupo={grupo}
                    items={visibles}
                    registros={registros}
                    abierto={filtroActivo || abiertos.has(grupo.id)}
                    onAlternar={() => alternarGrupo(grupo.id)}
                    onSubir={(itemId, file) => {
                      const lista = new DataTransfer();
                      lista.items.add(file);
                      agregar(lista.files, itemId);
                    }}
                  />
                );
              })}
              {filtroActivo &&
                !checklist.some((g) =>
                  g.items.some(
                    (i) =>
                      (filtro === "todos" || estadoDe(i.id) === filtro) &&
                      (!soloClaves || i.clave) &&
                      (!termino ||
                        normalizar(`${i.titulo} ${i.detalle} ${i.documento}`).includes(termino)),
                  ),
                ) && (
                  <p className="rounded-xl border border-dashed border-line px-5 py-8 text-center text-sm text-muted">
                    Ningún punto coincide con los filtros.
                  </p>
                )}
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-20" aria-label="Resumen de riesgo">
          <Semaforo nivel={nivel} verificados={verificados} total={ITEMS.length} motivos={motivos} />
          <ScoreEmpresa />
        </aside>
      </div>

      <p className="max-w-2xl text-xs leading-relaxed text-muted">
        La verificación es una demostración: los documentos no se envían ni se guardan. Ninguna
        verificación garantiza que una inversión sea segura; consultá con un abogado o escribano.
      </p>
    </div>
  );
}
