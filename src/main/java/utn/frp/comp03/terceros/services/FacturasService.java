package utn.frp.comp03.terceros.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.BrowserCallable;

import jakarta.annotation.security.RolesAllowed;
import utn.frp.comp03.terceros.model.Facturas;
import utn.frp.comp03.terceros.repositories.FacturasRepository;
import utn.frp.comp03.terceros.repositories.TercerosRepository;

@BrowserCallable
@Service
public class FacturasService {

    private final FacturasRepository facturasRepository;
    private final TercerosRepository tercerosRepository;

    public FacturasService(FacturasRepository facturasRepository,
                           TercerosRepository tercerosRepository) {
        this.facturasRepository = facturasRepository;
        this.tercerosRepository = tercerosRepository;
    }

    // Cualquier usuario logueado (normal o admin) puede ver el listado.
    @AnonymousAllowed
    public List<Facturas> list() {
        return facturasRepository.findAllWithDetails();
    }

    // Solo administradores pueden crear/editar.
    @RolesAllowed("ROLE_ADMIN")
    public Facturas save(Facturas factura) {
        if (factura.getTercero() == null || factura.getTercero().getId() == null) {
            throw new IllegalStateException(
                "Debe seleccionar un tercero antes de guardar la factura."
            );
        }
        boolean terceroExiste = tercerosRepository.existsById(factura.getTercero().getId());
        if (!terceroExiste) {
            throw new IllegalStateException(
                "El tercero seleccionado no se encuentra registrado en el sistema. " +
                "Verificá los datos o registrá el tercero primero."
            );
        }
        return facturasRepository.save(factura);
    }

    // Solo administradores pueden borrar.
    @RolesAllowed("ROLE_ADMIN")
    public void delete(Long id) {
        facturasRepository.deleteById(id);
    }
}