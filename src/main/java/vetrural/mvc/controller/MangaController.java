package vetrural.mvc.controller;

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
import vetrural.mvc.mapper.BoqueoMapper;
import vetrural.mvc.mapper.EventoSanitarioMapper;
import vetrural.mvc.mapper.PesajeMapper;
import vetrural.mvc.mapper.TactoMapper;
import vetrural.mvc.mapper.VacunacionMapper;
import vetrural.mvc.service.MangaService;
import java.util.List;

@RestController
@RequestMapping("/api/manga")
public class MangaController {

    @Autowired
    private MangaService mangaService;

    @PostMapping("/tacto")
    public ResponseEntity<TactoResponse> registrarTacto(@RequestBody RegistrarTactoRequest req) {
        return ResponseEntity.ok(TactoMapper.toResponse(
                mangaService.registrarTacto(req.getBovinoId(), req.getRegistradoPorId(), req.getSituacion(), req.getPeriodo())
        ));
    }

    @PostMapping("/pesaje")
    public ResponseEntity<PesajeResponse> registrarPesaje(@RequestBody RegistrarPesajeRequest req) {
        return ResponseEntity.ok(PesajeMapper.toResponse(
                mangaService.registrarPesaje(req.getBovinoId(), req.getRegistradoPorId(), req.getPeso())
        ));
    }

    @PostMapping("/boqueo")
    public ResponseEntity<BoqueoResponse> registrarBoqueo(@RequestBody RegistrarBoqueoRequest req) {
        return ResponseEntity.ok(BoqueoMapper.toResponse(
                mangaService.registrarBoqueo(req.getBovinoId(), req.getRegistradoPorId(), req.getDientes(), req.getDeterioro(), req.getDentadura())
        ));
    }

    @PostMapping("/vacunacion")
    public ResponseEntity<VacunacionResponse> registrarVacunacion(@RequestBody RegistrarVacunacionRequest req) {
        return ResponseEntity.ok(VacunacionMapper.toResponse(
                mangaService.registrarVacunacion(req.getBovinoId(), req.getRegistradoPorId(), req.getVacuna())
        ));
    }

    @GetMapping("/{bovinoId}/eventos")
    public List<EventoSanitarioResponse> getCronologia(@PathVariable String bovinoId) {
        return mangaService.getCronologia(bovinoId).stream()
                .map(EventoSanitarioMapper::toResponse)
                .toList();
    }

    @GetMapping("/{bovinoId}/ultimo-tacto")
    public ResponseEntity<TactoResponse> getUltimoTacto(@PathVariable String bovinoId) {
        return mangaService.getUltimoTacto(bovinoId)
                .map(TactoMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{bovinoId}/ultimo-pesaje")
    public ResponseEntity<PesajeResponse> getUltimoPesaje(@PathVariable String bovinoId) {
        return mangaService.getUltimoPesaje(bovinoId)
                .map(PesajeMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{bovinoId}/ultimo-boqueo")
    public ResponseEntity<BoqueoResponse> getUltimoBoqueo(@PathVariable String bovinoId) {
        return mangaService.getUltimoBoqueo(bovinoId)
                .map(BoqueoMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{bovinoId}/vacunaciones")
    public List<VacunacionResponse> getVacunaciones(@PathVariable String bovinoId) {
        return mangaService.getVacunaciones(bovinoId).stream()
                .map(VacunacionMapper::toResponse)
                .toList();
    }
}
