package vetrural.mvc.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vetrural.mvc.dto.CrearSesionRequest;
import vetrural.mvc.entity.Sesion;
import vetrural.mvc.entity.Usuario;
import vetrural.mvc.service.SesionService;
import vetrural.mvc.service.UsuarioService;
import java.util.List;

@RestController
@RequestMapping("/api/sesiones")
public class SesionController {

    @Autowired
    private SesionService sesionService;

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping
    public List<Sesion> listar() {
        return sesionService.listarSesiones();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sesion> getSesion(@PathVariable Long id) { // Obtiene una sesion por su ID
        return sesionService.getSesion(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Sesion> crear(@RequestBody CrearSesionRequest req) { // Crea una nueva sesion verificando que el anotador y veterinario existan
        Usuario anotador = usuarioService.getUsuario(req.getIdAnotador()).orElseThrow(() -> new IllegalArgumentException("Anotador no encontrado"));
        Usuario veterinario = usuarioService.getVeterinario(req.getIdVeterinario()).orElseThrow(() -> new IllegalArgumentException("Veterinario no encontrado"));
        Sesion sesion = sesionService.crearSesion(req.getEstablecimiento(), anotador, veterinario);
        return ResponseEntity.ok(sesion);
    }

    @PutMapping("/{id}/terminar")
    public ResponseEntity<Sesion> terminar(@PathVariable Long id) { // Termina una sesion por su ID
        return ResponseEntity.ok(sesionService.terminarSesion(id));
    }
}
