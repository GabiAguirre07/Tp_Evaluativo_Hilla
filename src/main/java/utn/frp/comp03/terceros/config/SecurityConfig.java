package utn.frp.comp03.terceros.config;

import com.vaadin.flow.spring.security.VaadinWebSecurity;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@EnableWebSecurity
@Configuration
public class SecurityConfig extends VaadinWebSecurity {

    static {
        System.out.println(">>> SecurityConfig CARGADO");
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        // Primero llamamos al padre para que Vaadin/Hilla configure
        // sus propios requestMatchers y el reconocimiento de @RolesAllowed.
        super.configure(http);

        // Deshabilitar el form login de Spring (usamos el propio de React).
        http.formLogin(form -> form.disable());
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}