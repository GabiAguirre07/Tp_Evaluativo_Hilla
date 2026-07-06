// UsuarioRepository.java
package utn.frp.comp03.terceros.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import utn.frp.comp03.terceros.model.Usuario;
import java.util.Optional;

@Repository
public interface UsuarioRepository 
        extends JpaRepository<Usuario, Long>,
                JpaSpecificationExecutor<Usuario> { 
    Optional<Usuario> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByCorreo(String correo);
}