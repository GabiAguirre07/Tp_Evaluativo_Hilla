/******************************************************************************
 * Copia manual de Frontend/generated/routes.tsx
 *
 * Se quitó `.protect()` porque esta app NO usa el sistema de autenticación
 * oficial de Hilla (Spring Security + AuthProvider/useAuth). La app maneja
 * su propio login (UsuarioService.login + sessionStorage), por lo que el
 * guard oficial de Hilla queda colgado esperando un estado de auth que
 * nunca se resuelve, dejando la pantalla en blanco sin errores.
 *
 * La protección de rutas ahora se hace a mano en cada vista (o en
 * @layout.tsx) revisando sessionStorage, tal como ya hacías en usuarios.tsx.
 ******************************************************************************/
import { RouterConfigurationBuilder } from "@vaadin/hilla-file-router/runtime.js";
import Flow from "Frontend/generated/flow/Flow";
import fileRoutes from "Frontend/generated/file-routes";

export const { router, routes } = new RouterConfigurationBuilder()
  .withFileRoutes(fileRoutes)
  .withFallback(Flow)
  // .protect()  <-- removido: no usamos el auth oficial de Hilla
  .build();
