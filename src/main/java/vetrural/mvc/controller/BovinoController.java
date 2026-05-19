package vetrural.mvc.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vetrural.mvc.dto.request.ActualizarBovinoRequest;
import vetrural.mvc.dto.request.CrearBovinoRapidoRequest;
import vetrural.mvc.dto.request.CrearBovinoRequest;
import vetrural.mvc.dto.response.BovinoResponse;
import vetrural.mvc.dto.response.HistorialBovinoResponse;
import vetrural.mvc.entity.Bovino;
import vetrural.mvc.entity.Boqueo;
import vetrural.mvc.entity.Pesaje;
import vetrural.mvc.entity.Tacto;
import vetrural.mvc.entity.Vacunacion;
import vetrural.mvc.enumerations.VacunaTipoEnum;
import vetrural.mvc.mapper.BovinoMapper;
import vetrural.mvc.service.BoqueoService;
import vetrural.mvc.service.BovinoService;
import vetrural.mvc.service.PesajeService;
import vetrural.mvc.service.TactoService;
import vetrural.mvc.service.VacunacionService;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bovinos")
public class BovinoController {

    @Autowired
    private BovinoService bovinoService;

    @Autowired
    private BoqueoService boqueoService;

    @Autowired
    private PesajeService pesajeService;

    @Autowired
    private TactoService tactoService;

    @Autowired
    private VacunacionService vacunacionService;

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

    @GetMapping("/historial")
    public ResponseEntity<HistorialBovinoResponse> getHistorialPorCaravana(@RequestParam String caravana) {
        return bovinoService.getBovinoPorCaravana(caravana)
                .map(this::buildHistorial)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/existe")
    public boolean existePorCaravana(@RequestParam String caravana) {
        return bovinoService.existePorCaravana(caravana);
    }

    private HistorialBovinoResponse buildHistorial(Bovino bovino) {
        Optional<Boqueo> ultimoBoqueo = boqueoService.getUltimoBoqueo(bovino);
        Optional<Pesaje> ultimoPesaje = pesajeService.getUltimoPesaje(bovino);
        Optional<Tacto> ultimoTacto = tactoService.getUltimoTacto(bovino);
        List<Vacunacion> vacunaciones = vacunacionService.getVacunacionesPorBovino(bovino);

        HistorialBovinoResponse.BoqueoHistorialResponse boqueo = ultimoBoqueo.map(b ->
                new HistorialBovinoResponse.BoqueoHistorialResponse(
                        b.getDientes(),
                        b.getDeterioro(),
                        b.getDentadura(),
                        b.getFechaHora()
                )).orElse(null);

        HistorialBovinoResponse.PesajeHistorialResponse pesaje = ultimoPesaje.map(p ->
                new HistorialBovinoResponse.PesajeHistorialResponse(
                        p.getPeso(),
                        p.getFechaHora()
                )).orElse(null);

        HistorialBovinoResponse.TactoHistorialResponse tacto = ultimoTacto.map(t ->
                new HistorialBovinoResponse.TactoHistorialResponse(
                        t.getSituacion(),
                        t.getPeriodo(),
                        t.getFechaHora()
                )).orElse(null);

        HistorialBovinoResponse.VacunacionHistorialResponse vacunacion = buildVacunacionesResponse(vacunaciones);

        return new HistorialBovinoResponse(
                bovino.getId(),
                bovino.getCaravana(),
                bovino.getEstablecimiento() != null ? bovino.getEstablecimiento().getId() : null,
                bovino.getNacimiento(),
                bovino.getSexo(),
                bovino.getLote(),
                bovino.getRaza(),
                bovino.getTipo(),
                boqueo,
                pesaje,
                tacto,
                vacunacion
        );
    }

    private HistorialBovinoResponse.VacunacionHistorialResponse buildVacunacionesResponse(List<Vacunacion> vacunaciones) {
        LocalDate aftosa = null;
        LocalDate brucelosis = null;
        LocalDate carbunco = null;
        LocalDate clostridial = null;
        LocalDate ibr = null;
        LocalDate bvd = null;

        for (Vacunacion v : vacunaciones) {
            if (aftosa == null && v.getVacuna() == VacunaTipoEnum.Aftosa) {
                aftosa = v.getFechaHora().toLocalDate();
            } else if (brucelosis == null && v.getVacuna() == VacunaTipoEnum.Brucelosis) {
                brucelosis = v.getFechaHora().toLocalDate();
            } else if (carbunco == null && v.getVacuna() == VacunaTipoEnum.Carbunco) {
                carbunco = v.getFechaHora().toLocalDate();
            } else if (clostridial == null && v.getVacuna() == VacunaTipoEnum.Clostridial) {
                clostridial = v.getFechaHora().toLocalDate();
            } else if (ibr == null && v.getVacuna() == VacunaTipoEnum.IBR) {
                ibr = v.getFechaHora().toLocalDate();
            } else if (bvd == null && v.getVacuna() == VacunaTipoEnum.BVD) {
                bvd = v.getFechaHora().toLocalDate();
            }
            if (aftosa != null && brucelosis != null && carbunco != null && clostridial != null && ibr != null && bvd != null) {
                break;
            }
        }

        return new HistorialBovinoResponse.VacunacionHistorialResponse(
                aftosa,
                brucelosis,
                carbunco,
                clostridial,
                ibr,
                bvd
        );
    }

    @PostMapping
    public ResponseEntity<BovinoResponse> crear(@Valid @RequestBody CrearBovinoRequest req) {
        Bovino bovino = bovinoService.crearBovino(
                req.getCaravana(),
                req.getEstablecimientoId(),
                req.getNacimiento(),
                req.getSexo(),
                req.getObs(),
                req.getRaza(),
                req.getTipo()
        );
        URI location = URI.create("/api/bovinos/" + bovino.getId());
        return ResponseEntity.created(location).body(BovinoMapper.toResponse(bovino));
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
                req.getObs()
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
}
