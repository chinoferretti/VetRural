package vetrural.mvc.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vetrural.mvc.dto.request.ActualizarBovinoRequest;
import vetrural.mvc.dto.request.CrearBovinoRapidoRequest;
import vetrural.mvc.dto.request.CrearBovinoRequest;
import vetrural.mvc.dto.request.DarBajaBovinoRequest;
import vetrural.mvc.dto.response.BovinoResponse;
import vetrural.mvc.dto.response.HistorialBovinoResponse;
import vetrural.mvc.entity.Bovino;
import vetrural.mvc.mapper.BovinoMapper;
import vetrural.mvc.service.BovinoService;
import java.net.URI;
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
    public ResponseEntity<BovinoResponse> getBovino(@PathVariable Long id) {
        return bovinoService.getBovino(id)
                .map(BovinoMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/buscar")
    public ResponseEntity<BovinoResponse> buscarPorCaravana(@RequestParam String caravana) {
        return bovinoService.getBovinoPorCaravana(caravana)
                .map(BovinoMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/existe")
    public boolean existePorCaravana(@RequestParam String caravana) {
        return bovinoService.existePorCaravana(caravana);
    }

    @PostMapping
    public ResponseEntity<BovinoResponse> crear(@Valid @RequestBody CrearBovinoRequest req) {
        Bovino bovino = bovinoService.crearBovino(
                req.getCaravana(),
                req.getEstablecimientoId(),
                req.getNacimiento(),
                req.getSexo(),
                req.getObs(),
                req.getApodo(),
                req.getRaza(),
                req.getTipo()
        );
        URI location = URI.create("/api/bovinos/" + bovino.getId());
        return ResponseEntity.created(location).body(BovinoMapper.toResponse(bovino));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarBovino(@PathVariable Long id){
        bovinoService.eliminarBovino(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/dar-baja")
    public ResponseEntity<BovinoResponse> darBaja(@PathVariable Long id, @Valid @RequestBody DarBajaBovinoRequest req) {
        Bovino bovino = bovinoService.darBaja(id, req.getEstado(), req.getMotivoBaja());
        return ResponseEntity.ok(BovinoMapper.toResponse(bovino));
    }

    @PutMapping("/{id}/dar-alta")
    public ResponseEntity<BovinoResponse> darAlta(@PathVariable Long id) {
        Bovino bovino = bovinoService.darAlta(id);
        return ResponseEntity.ok(BovinoMapper.toResponse(bovino));
    }

    @PostMapping("/rapido")
    public ResponseEntity<BovinoResponse> crearRapido(@Valid @RequestBody CrearBovinoRapidoRequest req) {
        Bovino bovino = bovinoService.crearBovinoRapido(req.getCaravana(), req.getEstablecimientoId(), req.getSexo());
        URI location = URI.create("/api/bovinos/" + bovino.getId());
        return ResponseEntity.created(location).body(BovinoMapper.toResponse(bovino));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BovinoResponse> actualizarBovino(@PathVariable Long id, @RequestBody ActualizarBovinoRequest req) {
        Bovino bovino = bovinoService.actualizarBovino(
                id,
                req.getCaravana(),
                req.getEstablecimientoId(),
                req.getNacimiento(),
                req.getSexo(),
                req.getLote(),
                req.getRaza(),
                req.getTipo(),
                req.getObs(),
                req.getApodo()
        );
        return ResponseEntity.ok(BovinoMapper.toResponse(bovino));
    }

    @PutMapping("/{id}/observaciones")
    public ResponseEntity<BovinoResponse> actualizarObs(@PathVariable Long id, @RequestParam String obs) {
        Bovino bovino = bovinoService.actualizarObservaciones(id, obs);
        return ResponseEntity.ok(BovinoMapper.toResponse(bovino));
    }

    @PutMapping("/{id}/lote")
    public ResponseEntity<Void> asignarLote(@PathVariable Long id, @RequestParam String lote) {
        bovinoService.anadirBovinoALote(id, lote);
        return ResponseEntity.noContent().build();
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
    public ResponseEntity<Void> crearLote(@RequestParam String nombre, @RequestBody List<Long> idBovinos) {
        bovinoService.crearLote(nombre, idBovinos);
        URI location = URI.create("/api/bovinos/lotes/" + nombre);
        return ResponseEntity.created(location).build();
    }

    @DeleteMapping("/lotes")
    public ResponseEntity<Void> eliminarLote(@RequestParam String nombre) {
        bovinoService.eliminarLote(nombre);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{caravana}/historial")
    public ResponseEntity<HistorialBovinoResponse> construirHistorial(@PathVariable String caravana){
        return ResponseEntity.ok(bovinoService.getHistorial(caravana));
    }
}
