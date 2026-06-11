package vetrural.mvc.service.Impl;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vetrural.mvc.dto.response.*;
import vetrural.mvc.entity.*;
import vetrural.mvc.enumerations.RazaBovinoEnum;
import vetrural.mvc.enumerations.SexoEnum;
import vetrural.mvc.enumerations.TipoBovinoEnum;
import vetrural.mvc.mapper.BoqueoMapper;
import vetrural.mvc.mapper.BovinoMapper;
import vetrural.mvc.mapper.PesajeMapper;
import vetrural.mvc.mapper.TactoMapper;
import vetrural.mvc.mapper.VacunacionMapper;
import vetrural.mvc.repository.BovinoRepository;
import vetrural.mvc.service.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BovinoServiceImpl implements BovinoService {

    @Autowired
    private BovinoRepository bovinoRepository;

    @Autowired
    private vetrural.mvc.repository.EventoSanitarioRepository eventoSanitarioRepository;

    @Autowired
    private EstablecimientoService establecimientoService;

    @Autowired
    private PesajeService pesajeService;

    @Autowired
    private TactoService tactoService;

    @Autowired
    private VacunacionService vacunacionService;

    @Autowired
    private BoqueoService boqueoService;

    @Override
    public Bovino crearBovino(String caravana, Long establecimientoId, LocalDate nacimiento, SexoEnum sexo, String obs, String apodo, RazaBovinoEnum raza, TipoBovinoEnum tipo) {
        if (bovinoRepository.existsByCaravana(caravana)) {
            throw new IllegalArgumentException("Ya existe un bovino con caravana: " + caravana);
        }
        Establecimiento establecimiento = establecimientoService.obtenerOFallar(establecimientoId);
        Bovino bovino = new Bovino();
        bovino.setCaravana(caravana);
        bovino.setEstablecimiento(establecimiento);
        bovino.setNacimiento(nacimiento);
        bovino.setSexo(sexo);
        bovino.setObservaciones(obs);
        bovino.setApodo(apodo);
        bovino.setRaza(raza);
        bovino.setTipo(tipo);
        return bovinoRepository.save(bovino);
    }

    @Override
    public Bovino crearBovinoRapido(String caravana, Long establecimientoId, SexoEnum sexo) {
        if (bovinoRepository.existsByCaravana(caravana)) {
            throw new IllegalArgumentException("Ya existe un bovino con caravana: " + caravana);
        }
        Establecimiento establecimiento = establecimientoService.obtenerOFallar(establecimientoId);
        Bovino bovino = new Bovino();
        bovino.setCaravana(caravana);
        bovino.setEstablecimiento(establecimiento);
        bovino.setSexo(sexo);
        return bovinoRepository.save(bovino);
    }

    @Override
    @Transactional
    public void eliminarBovino(Long id) {
        Bovino bovino = bovinoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Bovino no encontrado: " + id));
        // Borrar todos los eventos sanitarios antes de eliminar el bovino
        eventoSanitarioRepository.deleteAll(
            eventoSanitarioRepository.findByBovinoOrderByFechaHoraDesc(bovino)
        );
        bovinoRepository.delete(bovino);
    }

    @Override
    public boolean existePorCaravana(String caravana) {
        return bovinoRepository.existsByCaravana(caravana);
    }

    @Override
    public Optional<Bovino> getBovino(Long id) {
        return bovinoRepository.findById(id);
    }

    @Override
    public Optional<Bovino> getBovinoPorCaravana(String caravana) {
        return bovinoRepository.findByCaravana(caravana);
    }

    @Override
    public Bovino obtenerOFallar(Long id) {
        return bovinoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Bovino no encontrado: " + id));
    }

    @Override
    public Bovino obtenerOFallarPorCaravana(String caravana) {
        return bovinoRepository.findByCaravana(caravana)
                .orElseThrow(() -> new EntityNotFoundException("Bovino no encontrado con caravana: " + caravana));
    }

    @Override
    public List<Bovino> listarBovinos() {
        return bovinoRepository.findAll();
    }

    @Override
    public List<Bovino> listarBovinosPorLote(String lote) {
        return bovinoRepository.findByLote(lote);
    }

    @Override
    public List<Bovino> listarBovinosPorEstablecimiento(Long establecimientoId) {
        Establecimiento e = establecimientoService.obtenerOFallar(establecimientoId);
        return bovinoRepository.findByEstablecimiento(e);
    }

    @Override
    public List<String> getLotes() {
        return bovinoRepository.findDistinctLotes();
    }

    @Override
    @Transactional
    public void crearLote(String nombre, List<Long> idBovinos) {
        List<Bovino> bovinos = bovinoRepository.findAllById(idBovinos);
        if (bovinos.size() != idBovinos.size()) {
            List<Long> encontrados = bovinos.stream().map(Bovino::getId).toList();
            List<Long> faltantes = idBovinos.stream().filter(id -> !encontrados.contains(id)).collect(Collectors.toList());
            throw new EntityNotFoundException("Bovinos no encontrados: " + faltantes);
        }
        bovinos.forEach(b -> b.setLote(nombre));
        bovinoRepository.saveAll(bovinos);
    }

    @Override
    public void anadirBovinoALote(Long idBovino, String nombreLote) {
        Bovino b = obtenerOFallar(idBovino);
        b.setLote(nombreLote);
        bovinoRepository.save(b);
    }

    @Override
    public Bovino actualizarBovino(Long id, String caravana, Long establecimientoId, LocalDate nacimiento, SexoEnum sexo, String lote, RazaBovinoEnum raza, TipoBovinoEnum tipo, String obs, String apodo) {
        Bovino bovino = obtenerOFallar(id);
        if (caravana != null && !caravana.equals(bovino.getCaravana())) {
            if (bovinoRepository.existsByCaravana(caravana)) {
                throw new IllegalArgumentException("Ya existe un bovino con caravana: " + caravana);
            }
            bovino.setCaravana(caravana);
        }
        if (establecimientoId != null) {
            bovino.setEstablecimiento(establecimientoService.obtenerOFallar(establecimientoId));
        }
        bovino.setNacimiento(nacimiento);
        bovino.setSexo(sexo);
        bovino.setLote(lote);
        bovino.setRaza(raza);
        bovino.setTipo(tipo);
        bovino.setObservaciones(obs);
        bovino.setApodo(apodo);
        return bovinoRepository.save(bovino);
    }

    @Override
    public void eliminarLote(String nombreLote) {
        List<Bovino> bovinos = bovinoRepository.findByLote(nombreLote);
        bovinos.forEach(b -> b.setLote(null));
        bovinoRepository.saveAll(bovinos);
    }

    @Override
    public Bovino actualizarObservaciones(Long idBovino, String obs) {
        Bovino bovino = obtenerOFallar(idBovino);
        bovino.setObservaciones(obs);
        return bovinoRepository.save(bovino);
    }

    @Override
    public HistorialBovinoResponse getHistorial(String caravana) {
        Bovino bovino = bovinoRepository.findByCaravana(caravana)
                .orElseThrow(() -> new EntityNotFoundException("Bovino no encontrado: " + caravana));
        BoqueoResponse boqueo = boqueoService.getUltimoBoqueo(bovino)
                .map(BoqueoMapper::toResponse)
                .orElse(null);
        TactoResponse tacto = tactoService.getUltimoTacto(bovino)
                .map(TactoMapper::toResponse)
                .orElse(null);
        PesajeResponse pesaje = pesajeService.getUltimoPesaje(bovino)
                .map(PesajeMapper::toResponse)
                .orElse(null);
        List<VacunacionResponse> vacunaciones = vacunacionService.getVacunacionesPorBovino(bovino).stream()
                .map(VacunacionMapper::toResponse)
                .toList();
        return new HistorialBovinoResponse(BovinoMapper.toResponse(bovino), boqueo, pesaje, tacto, vacunaciones);
    }
}
