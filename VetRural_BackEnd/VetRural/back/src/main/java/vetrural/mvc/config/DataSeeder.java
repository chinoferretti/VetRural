package vetrural.mvc.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import vetrural.mvc.enumerations.TipoUsuarioEnum;
import vetrural.mvc.service.UsuarioService;

@Component
public class DataSeeder implements ApplicationRunner {

    private final JdbcTemplate jdbc;
    private final UsuarioService usuarioService;

    public DataSeeder(JdbcTemplate jdbc, UsuarioService usuarioService) {
        this.jdbc = jdbc;
        this.usuarioService = usuarioService;
    }

    @Override
    public void run(ApplicationArguments args) {
        // Usuario sistema interno (id fijo -1)
        try {
            Integer existe = jdbc.queryForObject(
                "SELECT COUNT(*) FROM usuario WHERE id_usuario = -1",
                Integer.class
            );
            if (existe == null || existe == 0) {
                jdbc.update(
                    "INSERT INTO usuario (id_usuario, nombre, apellido, email, contrasena, tipo) " +
                    "VALUES (-1, 'No especifico', '', 'no-especifico@sistema.local', '', 'Veterinario')"
                );
                System.out.println("[DataSeeder] Usuario sistema (-1) insertado.");
            }
        } catch (Exception e) {
            System.err.println("[DataSeeder] Error usuario sistema: " + e.getMessage());
        }

        // Usuario de prueba: admin@vetrural.com / admin123
        try {
            if (usuarioService.getByEmail("admin@vetrural.com").isEmpty()) {
                usuarioService.crear("Admin", "VetRural", "admin@vetrural.com", "admin123", TipoUsuarioEnum.Veterinario);
                System.out.println("[DataSeeder] Usuario de prueba creado: admin@vetrural.com / admin123");
            }
        } catch (Exception e) {
            System.err.println("[DataSeeder] Error usuario de prueba: " + e.getMessage());
        }
    }
}
