package utn.frp.comp03.terceros.config;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import utn.frp.comp03.terceros.model.Usuario;
import utn.frp.comp03.terceros.repositories.UsuarioRepository;

/**
 * Le dice a Spring Security cómo buscar un usuario y qué roles tiene.
 * Todo usuario logueado recibe ROLE_USER; si además tiene admin = true en
 * la base, recibe también ROLE_ADMIN. Estos roles son los que después
 * chequean los @RolesAllowed("ROLE_ADMIN") en los Services.
 */
@Service
public class UsersDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public UsersDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        if (Boolean.TRUE.equals(usuario.getAdmin())) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }

        return new User(usuario.getUsername(), usuario.getPasswordHash(), authorities);
    }
}
