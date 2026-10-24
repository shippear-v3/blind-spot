import { hitos, observaciones, proyecto } from "./datos";
import { diasEntre } from "./fechas";
import { ETAPAS, type Alerta, type Hito, type HitoConEstado, type ObservacionConFoto } from "./tipos";

const HOY = proyecto.fecha_demo;

function nivelEtapa(etapa: string) {
  return (ETAPAS as readonly string[]).indexOf(etapa);
}

function venceOPendiente(hito: Hito): Pick<HitoConEstado, "estado"> {
  return HOY > hito.fecha_prometida
    ? { estado: "vencido_sin_evidencia" }
    : { estado: "pendiente" };
}

export function fotosOrdenadas(extra: ObservacionConFoto[] = []) {
  return [...observaciones, ...extra].sort((a, b) => a.fecha.localeCompare(b.fecha));
}

function estadoHito(hito: Hito, fotos: ObservacionConFoto[]): Omit<HitoConEstado, keyof Hito> {
  if (hito.tipo === "documento") {
    const evidencia = hito.evidencia_documental;
    if (evidencia) {
      return {
        estado: "cumplido",
        fecha: evidencia.fecha,
        evidencia: evidencia.fuente,
      };
    }
    return venceOPendiente(hito);
  }

  if (!hito.etapa_minima) return venceOPendiente(hito);

  const prueba = fotos.find((foto) => {
    if (foto.confianza === "baja") return false;
    if (nivelEtapa(foto.etapa) < nivelEtapa(hito.etapa_minima!)) return false;
    if (hito.pisos_minimos == null) return true;
    return (foto.pisos_con_estructura_visibles ?? 0) >= hito.pisos_minimos;
  });

  if (!prueba) return venceOPendiente(hito);

  return {
    estado: prueba.fecha > hito.fecha_prometida ? "cumplido_con_atraso" : "cumplido",
    fecha: prueba.fecha,
    evidencia: prueba.foto,
  };
}

export function cronograma(extra: ObservacionConFoto[] = []): HitoConEstado[] {
  const fotos = fotosOrdenadas(extra);
  return hitos.map((hito) => ({ ...hito, ...estadoHito(hito, fotos) }));
}

export function alertasDe(items: HitoConEstado[], fotos: ObservacionConFoto[]): Alerta[] {
  const salida: Alerta[] = [];
  for (const hito of items) {
    if (hito.estado === "vencido_sin_evidencia") {
      salida.push({
        tipo: "vencido",
        nombre: hito.nombre,
        fecha: hito.fecha_prometida,
      });
    }
  }

  const ultima = fotos.at(-1);
  if (!ultima) {
    salida.push({ tipo: "sin_fotos" });
    return salida;
  }

  const dias = diasEntre(ultima.fecha, HOY);
  if (dias >= 3) {
    salida.push({ tipo: "silencio", dias, fecha: ultima.fecha });
  }
  return salida;
}
