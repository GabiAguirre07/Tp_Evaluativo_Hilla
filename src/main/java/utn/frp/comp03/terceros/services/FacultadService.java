package utn.frp.comp03.terceros.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.BrowserCallable;

import jakarta.annotation.security.RolesAllowed;
import utn.frp.comp03.terceros.model.Facultad;
import utn.frp.comp03.terceros.repositories.FacultadRepository;

@BrowserCallable
@Service
public class FacultadService {

    private final FacultadRepository facultadRepository;

    public FacultadService(FacultadRepository facultadRepository) {
        this.facultadRepository = facultadRepository;
    }

    // Cualquier usuario logueado (normal o admin) puede ver el listado.
    @AnonymousAllowed
    public List<Facultad> list() {
        return facultadRepository.findAll();
    }

    // Solo administradores pueden crear/editar.
    @RolesAllowed("ROLE_ADMIN")
    public Facultad save(Facultad facultad) {
        return facultadRepository.save(facultad);
    }

    // Solo administradores pueden borrar.
    @RolesAllowed("ROLE_ADMIN")
    public void delete(Long id) {
        facultadRepository.deleteById(id);
    }
}