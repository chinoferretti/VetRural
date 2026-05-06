package vetrural.mvc.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vetrural.mvc.entity.Usuario;
import vetrural.mvc.service.UsuarioService;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping
    public List<Usuario> listar() { // Obtiene la lista de todos los usuarios registrados en SQL
        return usuarioService.listarUsuarios();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getUsuario(@PathVariable Long id) { // Obtiene un usuario por su ID
        return usuarioService.getUsuario(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Usuario> crear(@RequestBody Usuario usuario) { // Crea un nuevo usuario
        return ResponseEntity.ok(usuarioService.guardarUsuario(usuario));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) { // Elimina un usuario por su ID
        usuarioService.eliminarUsuario(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/veterinarios")
    public List<Usuario> listarVeterinarios() { // Obtiene la lista de todos los veterinarios registrados en SQL
        return usuarioService.listarVeterinarios();
    }

    @GetMapping("/veterinarios/{id}/existe")
    public boolean existeVeterinario(@PathVariable Long id) { // Verifica si existe un veterinario por su ID, devolviendo true o false
        return usuarioService.existeVeterinario(id);
    }

    @GetMapping("/veterinarios/{id}")
    public ResponseEntity<Usuario> getVeterinario(@PathVariable Long id) { // Obtiene un veterinario por su ID, verificando que el tipo de usuario sea Veterinario
        return usuarioService.getVeterinario(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
