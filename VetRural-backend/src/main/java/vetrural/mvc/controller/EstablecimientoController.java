package vetrural.mvc.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vetrural.mvc.dto.request.CrearEstablecimientoRequest;
import vetrural.mvc.dto.response.BovinoResponse;
import vetrural.mvc.dto.response.EstablecimientoResponse;
import vetrural.mvc.entity.Establecimiento;
import vetrural.mvc.mapper.BovinoMapper;
import vetrural.mvc.mapper.EstablecimientoMapper;
import vetrural.mvc.service.BovinoService;
import vetrural.mvc.service.EstablecimientoService;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/establecimientos")
public class EstablecimientoController {

    @Autowired
    private EstablecimientoService establecimientoService;

    @Autowired
    private BovinoService bovinoService;

    @GetMapping
    public List<EstablecimientoResponse> listar() {
        return establecimientoService.listar().stream()
                .map(EstablecimientoMapper::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<EstablecimientoResponse> getEstablecimiento(@PathVariable Long id) {
        return establecimientoService.getEstablecimiento(id)
                .map(EstablecimientoMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<EstablecimientoResponse> crear(@Valid @RequestBody CrearEstablecimientoRequest req) {
        Establecimiento e = establecimientoService.crear(req.getNombre());
        URI location = URI.create("/api/establecimientos/" + e.getId());
        return ResponseEntity.created(location).body(EstablecimientoMapper.toResponse(e));
    }

    @GetMapping("/{id}/bovinos")
    public List<BovinoResponse> getBovinos(@PathVariable Long id) {
        return bovinoService.listarBovinosPorEstablecimiento(id).stream()
                .map(BovinoMapper::toResponse)
                .toList();
    }

    @PostMapping("/{id}/usuarios/{usuarioId}")
    public ResponseEntity<Void> asociarUsuario(@PathVariable Long id, @PathVariable Long usuarioId) {
        establecimientoService.asociarUsuario(id, usuarioId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/usuarios/{usuarioId}")
    public ResponseEntity<Void> desasociarUsuario(@PathVariable Long id, @PathVariable Long usuarioId) {
        establecimientoService.desasociarUsuario(id, usuarioId);
        return ResponseEntity.noContent().build();
    }
}
