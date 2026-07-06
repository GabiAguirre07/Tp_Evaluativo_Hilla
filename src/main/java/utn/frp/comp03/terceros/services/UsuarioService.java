package utn.frp.comp03.terceros.services;

import java.util.List;
import java.util.Optional;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.BrowserCallable;

import jakarta.annotation.security.RolesAllowed;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import utn.frp.comp03.terceros.model.Usuario;
import utn.frp.comp03.terceros.repositories.UsuarioRepository;

@BrowserCallable
@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder encoder; // inyectado desde donde ya lo tengas definido
    private final AuthenticationManager authenticationManager;
    private final HttpServletRequest httpServletRequest;
    private final HttpServletResponse httpServletResponse;
    private final SecurityContextRepository securityContextRepository =
            new HttpSessionSecurityContextRepository();

    public UsuarioService(UsuarioRepository usuarioRepository,
                           PasswordEncoder encoder,
                           AuthenticationManager authenticationManager,
                           HttpServletRequest httpServletRequest,
                           HttpServletResponse httpServletResponse) {
        this.usuarioRepository = usuarioRepository;
        this.encoder = encoder;
        this.authenticationManager = authenticationManager;
        this.httpServletRequest = httpServletRequest;
        this.httpServletResponse = httpServletResponse;
    }

    // Cualquiera puede registrarse; siempre queda como usuario normal,
    // nunca admin (eso se otorga a mano desde el panel de Usuarios).
    @AnonymousAllowed
    public boolean registrar(String username, String correo, String password) {
        if (usuarioRepository.existsByUsername(username)) return false;
        if (usuarioRepository.existsByCorreo(correo))    return false;
        Usuario u = new Usuario();
        u.setUsername(username);
        u.setCorreo(correo);
        u.setPasswordHash(encoder.encode(password));
        u.setAdmin(false);
        usuarioRepository.save(u);
        return true;
    }

    // Cualquiera puede intentar loguearse.
    @AnonymousAllowed
    public Optional<Usuario> login(String username, String password) {
        Optional<Usuario> opt = usuarioRepository.findByUsername(username);
        if (opt.isEmpty()) return Optional.empty();

        try {
            // Autenticamos de verdad contra Spring Security (no solo
            // comparamos la contraseña a mano), para que quede una sesión
            // autenticada real del lado del servidor, con el rol
            // correspondiente (ROLE_USER y, si aplica, ROLE_ADMIN).
            UsernamePasswordAuthenticationToken authRequest =
                    new UsernamePasswordAuthenticationToken(username, password);
            Authentication authResult = authenticationManager.authenticate(authRequest);

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authResult);
            SecurityContextHolder.setContext(context);

            // Persistimos el contexto en la sesión HTTP para que las
            // próximas requests (que llegan con la cookie de sesión) ya
            // vengan autenticadas automáticamente.
            securityContextRepository.saveContext(context, httpServletRequest, httpServletResponse);
        } catch (AuthenticationException e) {
            // Usuario o contraseña incorrectos.
            return Optional.empty();
        }

        return opt;
    }

    // Cierra la sesión autenticada del lado del servidor. El frontend debe
    // llamar a esto antes de limpiar su sessionStorage, para no dejar una
    // sesión "viva" en el servidor después de que el usuario se desloguea.

    @AnonymousAllowed
    public void logout() {
        new SecurityContextLogoutHandler()
                .logout(httpServletRequest, httpServletResponse, 
                         SecurityContextHolder.getContext().getAuthentication());
    }

    // Gestión de usuarios (ver/crear/editar/borrar OTRAS cuentas):
    // solo administradores.
    @RolesAllowed("ROLE_ADMIN")
    public List<Usuario> list() {
        return usuarioRepository.findAll();
    }

    @RolesAllowed("ROLE_ADMIN")
    public Usuario save(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    @RolesAllowed("ROLE_ADMIN")
    public void delete(Long id) {
        usuarioRepository.deleteById(id);
    }
}