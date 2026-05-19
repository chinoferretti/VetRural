package vetrural.mvc.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vetrural.mvc.dto.request.CrearUsuarioRequest;
import vetrural.mvc.dto.response.EstablecimientoResponse;
import vetrural.mvc.dto.response.UsuarioResponse;
import vetrural.mvc.entity.Usuario;
import vetrural.mvc.mapper.EstablecimientoMapper;
import vetrural.mvc.mapper.UsuarioMapper;
import vetrural.mvc.service.UsuarioService;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping
    public List<UsuarioResponse> listar() {
        return usuarioService.listarUsuarios().stream()
                .map(UsuarioMapper::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> getUsuario(@PathVariable Long id) {
        return usuarioService.getUsuario(id)
                .map(UsuarioMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> crear(@Valid @RequestBody CrearUsuarioRequest req) {
        Usuario u = usuarioService.crear(req.getNombre(), req.getApellido(), req.getEmail(), req.getContrasena(), req.getTipo());
        URI location = URI.create("/api/usuarios/" + u.getIdUsuario());
        return ResponseEntity.created(location).body(UsuarioMapper.toResponse(u));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        usuarioService.eliminarUsuario(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/veterinarios")
    public List<UsuarioResponse> listarVeterinarios() {
        return usuarioService.listarVeterinarios().stream()
                .map(UsuarioMapper::toResponse)
                .toList();
    }

    @GetMapping("/{id}/establecimientos")
    public List<EstablecimientoResponse> getEstablecimientos(@PathVariable Long id) {
        return usuarioService.getEstablecimientos(id).stream()
                .map(EstablecimientoMapper::toResponse)
                .toList();
    }
}
