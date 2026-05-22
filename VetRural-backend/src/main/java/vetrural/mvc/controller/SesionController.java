package vetrural.mvc.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vetrural.mvc.dto.request.CrearSesionRequest;
import vetrural.mvc.dto.response.SesionResponse;
import vetrural.mvc.entity.EventoSanitario;
import vetrural.mvc.entity.Sesion;
import vetrural.mvc.mapper.SesionMapper;
import vetrural.mvc.repository.EventoSanitarioRepository;
import vetrural.mvc.service.SesionService;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/sesiones")
public class SesionController {

    @Autowired
    private SesionService sesionService;

    @Autowired
    private EventoSanitarioRepository eventoRepo;

    @PostMapping
    public ResponseEntity<SesionResponse> crear(@Valid @RequestBody CrearSesionRequest req) {
        Sesion sesion = sesionService.crear(req.getVeterinarioId(), req.getAnotador(), req.getEstablecimientoId());
        URI location = URI.create("/api/sesiones/" + sesion.getId());
        return ResponseEntity.created(location).body(SesionMapper.toResponse(sesion));
    }

    @GetMapping
    public List<SesionResponse> listar(@RequestParam Long establecimientoId) {
        return sesionService.listarPorEstablecimiento(establecimientoId).stream()
                .map(s -> {
                    List<EventoSanitario> eventos = eventoRepo.findBySesion(s);
                    return SesionMapper.toResponse(s, eventos);
                })
                .toList();
    }
}
