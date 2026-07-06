package utn.frp.comp03.terceros.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import utn.frp.comp03.terceros.model.Facturas;

public interface FacturasRepository extends JpaRepository<Facturas, Long>,
JpaSpecificationExecutor<Facturas> {
	
	@Query("SELECT f FROM Facturas f LEFT JOIN FETCH f.tercero LEFT JOIN FETCH f.items")
    List<Facturas> findAllWithDetails();

	boolean existsByTerceroId(Long terceroId);
	
}