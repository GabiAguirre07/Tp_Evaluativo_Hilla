package utn.frp.comp03.terceros.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import utn.frp.comp03.terceros.model.Pagos;

public interface PagosRepository extends JpaRepository<Pagos,Long> {
	
	@Query("SELECT p FROM Pagos p LEFT JOIN FETCH p.tercero LEFT JOIN FETCH p.detalle")
	List<Pagos> findAllWithDetails();

}
