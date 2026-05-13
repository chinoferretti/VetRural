package vetrural.mvc.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vetrural.mvc.dto.request.CrearBovinoRapidoRequest;
import vetrural.mvc.dto.request.CrearBovinoRequest;
import vetrural.mvc.dto.response.BovinoResponse;
import vetrural.mvc.entity.Bovino;
import vetrural.mvc.mapper.BovinoMapper;
import vetrural.mvc.service.BovinoService;
import java.util.List;

@RestController
@RequestMapping("/api/bovinos")
public class BovinoController {

    @Autowired
    private BovinoService bovinoService;

    @GetMapping
    public List<BovinoResponse> listar() {
        return bovinoService.listarBovinos().stream()
                .map(BovinoMapper::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<BovinoResponse> getBovino(@PathVariable String id) {
        return bovinoService.getBovino(id)
                .map(BovinoMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<BovinoResponse> crear(@RequestBody CrearBovinoRequest req) {
        Bovino bovino = bovinoService.crearBovino(
                req.getId(),
                req.getEstablecimientoId(),
                req.getNacimiento(),
                req.getSexo(),
                req.getObs(),
                req.getRaza(),
                req.getTipo()
        );
        return ResponseEntity.ok(BovinoMapper.toResponse(bovino));
    }

    @PostMapping("/rapido")
    public ResponseEntity<BovinoResponse> crearRapido(@RequestBody CrearBovinoRapidoRequest req) {
        Bovino bovino = bovinoService.crearBovinoRapido(req.getId(), req.getEstablecimientoId(), req.getSexo());
        return ResponseEntity.ok(BovinoMapper.toResponse(bovino));
    }

    @PutMapping("/{id}/observaciones")
    public ResponseEntity<BovinoResponse> actualizarObs(@PathVariable String id, @RequestParam String obs) {
        Bovino bovino = bovinoService.actualizarObservaciones(id, obs);
        return ResponseEntity.ok(BovinoMapper.toResponse(bovino));
    }

    @PutMapping("/{id}/lote")
    public ResponseEntity<Void> asignarLote(@PathVariable String id, @RequestParam String lote) {
        bovinoService.anadirBovinoALote(id, lote);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/existe")
    public boolean existeBovino(@PathVariable String id) {
        return bovinoService.existeBovino(id);
    }

    @GetMapping("/lotes")
    public List<String> getLotes() {
        return bovinoService.getLotes();
    }

    @GetMapping("/lotes/{lote}")
    public List<BovinoResponse> getBovinosPorLote(@PathVariable String lote) {
        return bovinoService.listarBovinosPorLote(lote).stream()
                .map(BovinoMapper::toResponse)
                .toList();
    }

    @PostMapping("/lotes")
    public ResponseEntity<Void> crearLote(@RequestParam String nombre, @RequestBody List<String> idBovinos) {
        bovinoService.crearLote(nombre, idBovinos);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/lotes")
    public ResponseEntity<Void> eliminarLote(@RequestParam String nombre) {
        bovinoService.eliminarLote(nombre);
        return ResponseEntity.ok().build();
    }
}
