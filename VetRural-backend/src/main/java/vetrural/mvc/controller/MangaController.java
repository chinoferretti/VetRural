package vetrural.mvc.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vetrural.mvc.dto.request.RegistrarBoqueoRequest;
import vetrural.mvc.dto.request.RegistrarPesajeRequest;
import vetrural.mvc.dto.request.RegistrarTactoRequest;
import vetrural.mvc.dto.request.RegistrarVacunacionRequest;
import vetrural.mvc.dto.response.BoqueoResponse;
import vetrural.mvc.dto.response.EventoSanitarioResponse;
import vetrural.mvc.dto.response.PesajeResponse;
import vetrural.mvc.dto.response.TactoResponse;
import vetrural.mvc.dto.response.VacunacionResponse;
import vetrural.mvc.entity.Boqueo;
import vetrural.mvc.entity.Pesaje;
import vetrural.mvc.entity.Tacto;
import vetrural.mvc.entity.Vacunacion;
import vetrural.mvc.mapper.BoqueoMapper;
import vetrural.mvc.mapper.EventoSanitarioMapper;
import vetrural.mvc.mapper.PesajeMapper;
import vetrural.mvc.mapper.TactoMapper;
import vetrural.mvc.mapper.VacunacionMapper;
import vetrural.mvc.service.MangaService;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/manga")
public class MangaController {

    @Autowired
    private MangaService mangaService;

    @PostMapping("/tacto")
    public ResponseEntity<TactoResponse> registrarTacto(@Valid @RequestBody RegistrarTactoRequest req) {
        Tacto t = mangaService.registrarTacto(req.getBovinoId(), req.getSesionId(), req.getSituacion(), req.getPeriodo());
        URI location = URI.create("/api/manga/" + req.getBovinoId() + "/ultimo-tacto");
        return ResponseEntity.created(location).body(TactoMapper.toResponse(t));
    }

    @PostMapping("/pesaje")
    public ResponseEntity<PesajeResponse> registrarPesaje(@Valid @RequestBody RegistrarPesajeRequest req) {
        Pesaje p = mangaService.registrarPesaje(req.getBovinoId(), req.getSesionId(), req.getPeso());
        URI location = URI.create("/api/manga/" + req.getBovinoId() + "/ultimo-pesaje");
        return ResponseEntity.created(location).body(PesajeMapper.toResponse(p));
    }

    @PostMapping("/boqueo")
    public ResponseEntity<BoqueoResponse> registrarBoqueo(@Valid @RequestBody RegistrarBoqueoRequest req) {
        Boqueo b = mangaService.registrarBoqueo(req.getBovinoId(), req.getSesionId(), req.getDientes(), req.getDeterioro(), req.getDentadura());
        URI location = URI.create("/api/manga/" + req.getBovinoId() + "/ultimo-boqueo");
        return ResponseEntity.created(location).body(BoqueoMapper.toResponse(b));
    }

    @PostMapping("/vacunacion")
    public ResponseEntity<VacunacionResponse> registrarVacunacion(@Valid @RequestBody RegistrarVacunacionRequest req) {
        Vacunacion v = mangaService.registrarVacunacion(req.getBovinoId(), req.getSesionId(), req.getVacuna());
        URI location = URI.create("/api/manga/" + req.getBovinoId() + "/vacunaciones");
        return ResponseEntity.created(location).body(VacunacionMapper.toResponse(v));
    }

    @GetMapping("/{bovinoId}/eventos")
    public List<EventoSanitarioResponse> getCronologia(@PathVariable Long bovinoId) {
        return mangaService.getCronologia(bovinoId).stream()
                .map(EventoSanitarioMapper::toResponse)
                .toList();
    }

    @GetMapping("/{bovinoId}/ultimo-tacto")
    public ResponseEntity<TactoResponse> getUltimoTacto(@PathVariable Long bovinoId) {
        return mangaService.getUltimoTacto(bovinoId)
                .map(TactoMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{bovinoId}/ultimo-pesaje")
    public ResponseEntity<PesajeResponse> getUltimoPesaje(@PathVariable Long bovinoId) {
        return mangaService.getUltimoPesaje(bovinoId)
                .map(PesajeMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{bovinoId}/ultimo-boqueo")
    public ResponseEntity<BoqueoResponse> getUltimoBoqueo(@PathVariable Long bovinoId) {
        return mangaService.getUltimoBoqueo(bovinoId)
                .map(BoqueoMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{bovinoId}/vacunaciones")
    public List<VacunacionResponse> getVacunaciones(@PathVariable Long bovinoId) {
        return mangaService.getVacunaciones(bovinoId).stream()
                .map(VacunacionMapper::toResponse)
                .toList();
    }
}
