package utn.frp.comp03.terceros.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.BrowserCallable;

import jakarta.annotation.security.RolesAllowed;
import utn.frp.comp03.terceros.model.Pagos;
import utn.frp.comp03.terceros.repositories.PagosRepository;

@BrowserCallable
@Service
public class PagosService {

		    private final PagosRepository pagosRepository;

		    public PagosService(PagosRepository pagosRepository) {
		        this.pagosRepository = pagosRepository;
		    }

		    // Cualquier usuario logueado (normal o admin) puede ver el listado.
		    @AnonymousAllowed
		    public List<Pagos> list() {
		        return pagosRepository.findAllWithDetails();  // ← en vez de findAll()
		    }

		    // Solo administradores pueden crear/editar.
		    @RolesAllowed("ROLE_ADMIN")
		    public Pagos save(Pagos pago) {
		    	// Hilla deserializa el JSON sin setear la referencia inversa:
		    	// detalle.pago queda null y Hibernate no puede resolver id_pagos.
		    	// Lo seteamos a mano antes de persistir.
		        if (pago.getDetalle() != null) {
		            pago.getDetalle().setPago(pago);
		        }
		        return pagosRepository.save(pago);
		    }

		    // Solo administradores pueden borrar.
		    @RolesAllowed("ROLE_ADMIN")
		    public void delete(Long id) {
		    	pagosRepository.deleteById(id);
		    }
		}