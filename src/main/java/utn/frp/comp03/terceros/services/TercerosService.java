package utn.frp.comp03.terceros.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.BrowserCallable;

import jakarta.annotation.security.RolesAllowed;
import utn.frp.comp03.terceros.model.Terceros;
import utn.frp.comp03.terceros.repositories.FacturasRepository;
import utn.frp.comp03.terceros.repositories.TercerosRepository;

@BrowserCallable
@Service
public class TercerosService {

    private final TercerosRepository tercerosRepository;
    private final FacturasRepository facturasRepository;

    public TercerosService(TercerosRepository tercerosRepository,
                           FacturasRepository facturasRepository) {
        this.tercerosRepository = tercerosRepository;
        this.facturasRepository = facturasRepository;
    }

    // Cualquier usuario logueado (normal o admin) puede ver el listado.
    @AnonymousAllowed
    public List<Terceros> list() {
        return tercerosRepository.findAll();
    }

    // Solo administradores pueden crear/editar.
    @RolesAllowed("ROLE_ADMIN")
    public Terceros save(Terceros tercero) {
        return tercerosRepository.save(tercero);
    }

    // Solo administradores pueden borrar.
    @RolesAllowed("ROLE_ADMIN")
    public void delete(Long id) {
        if (facturasRepository.existsByTerceroId(id)) {
            throw new IllegalStateException(
                "No se puede eliminar el tercero porque tiene facturas asociadas. " +
                "Eliminá o reasigná las facturas primero."
            );
        }
        tercerosRepository.deleteById(id);
    }
}