package utn.frp.comp03;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        System.out.println(">>> Iniciando aplicación desde: " + Application.class.getPackageName());
        SpringApplication.run(Application.class, args);
    }
}