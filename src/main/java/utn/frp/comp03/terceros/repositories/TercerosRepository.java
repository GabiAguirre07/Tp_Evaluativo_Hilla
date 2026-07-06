package utn.frp.comp03.terceros.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import utn.frp.comp03.terceros.model.Terceros;

@Repository
public interface TercerosRepository
        extends JpaRepository<Terceros, Long>,
                JpaSpecificationExecutor<Terceros> {
}