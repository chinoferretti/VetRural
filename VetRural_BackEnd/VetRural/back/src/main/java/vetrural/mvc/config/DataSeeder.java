package vetrural.mvc.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements ApplicationRunner {

    private final JdbcTemplate jdbc;

    public DataSeeder(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            Integer existe = jdbc.queryForObject(
                "SELECT COUNT(*) FROM Usuario WHERE idUsuario = -1",
                Integer.class
            );
            if (existe == null || existe == 0) {
                jdbc.update(
                    "INSERT INTO Usuario (idUsuario, nombre, apellido, email, contrasena, tipo) " +
                    "VALUES (-1, 'No especifico', '', 'no-especifico@sistema.local', '', 'Veterinario')"
                );
            }
        } catch (Exception e) {
            System.err.println("[DataSeeder] " + e.getMessage());
        }
    }
}
