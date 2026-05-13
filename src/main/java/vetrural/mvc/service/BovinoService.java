package vetrural.mvc.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vetrural.mvc.entity.Bovino;
import vetrural.mvc.entity.Establecimiento;
import vetrural.mvc.enumerations.RazaBovinoEnum;
import vetrural.mvc.enumerations.SexoEnum;
import vetrural.mvc.enumerations.TipoBovinoEnum;
import vetrural.mvc.repository.BovinoRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BovinoService {

    @Autowired
    private BovinoRepository bovinoRepository;

    @Autowired
    private EstablecimientoService establecimientoService;

    public Bovino crearBovino(String id, Long establecimientoId, LocalDate nacimiento, SexoEnum sexo, String obs, RazaBovinoEnum raza, TipoBovinoEnum tipo) {
        Establecimiento establecimiento = establecimientoService.obtenerOFallar(establecimientoId);
        Bovino bovino = new Bovino();
        bovino.setIdAnimal(id);
        bovino.setEstablecimiento(establecimiento);
        bovino.setNacimiento(nacimiento);
        bovino.setSexo(sexo);
        bovino.setObservaciones(obs);
        bovino.setRaza(raza);
        bovino.setTipo(tipo);
        return bovinoRepository.save(bovino);
    }

    public Bovino crearBovinoRapido(String id, Long establecimientoId, SexoEnum sexo) {
        Establecimiento establecimiento = establecimientoService.obtenerOFallar(establecimientoId);
        Bovino bovino = new Bovino();
        bovino.setIdAnimal(id);
        bovino.setEstablecimiento(establecimiento);
        bovino.setSexo(sexo);
        return bovinoRepository.save(bovino);
    }

    public void eliminarBovino(String id) {
        bovinoRepository.deleteById(id);
    }

    public boolean existeBovino(String idBovino) {
        return bovinoRepository.existsById(idBovino);
    }

    public Optional<Bovino> getBovino(String idBovino) {
        return bovinoRepository.findById(idBovino);
    }

    public Bovino obtenerOFallar(String idBovino) {
        return bovinoRepository.findById(idBovino)
                .orElseThrow(() -> new IllegalArgumentException("Bovino no encontrado: " + idBovino));
    }

    public List<Bovino> listarBovinos() {
        return bovinoRepository.findAll();
    }

    public List<Bovino> listarBovinosPorLote(String lote) {
        return bovinoRepository.findByLote(lote);
    }

    public List<Bovino> listarBovinosPorEstablecimiento(Long establecimientoId) {
        Establecimiento e = establecimientoService.obtenerOFallar(establecimientoId);
        return bovinoRepository.findByEstablecimiento(e);
    }

    public List<String> getLotes() {
        return bovinoRepository.findAll().stream()
                .map(Bovino::getLote)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
    }

    public void crearLote(String nombre, List<String> idBovinos) {
        idBovinos.forEach(id -> bovinoRepository.findById(id).ifPresent(b -> {
            b.setLote(nombre);
            bovinoRepository.save(b);
        }));
    }

    public void anadirBovinoALote(String idBovino, String nombreLote) {
        bovinoRepository.findById(idBovino).ifPresent(b -> {
            b.setLote(nombreLote);
            bovinoRepository.save(b);
        });
    }

    public void eliminarLote(String nombreLote) {
        bovinoRepository.findByLote(nombreLote).forEach(b -> {
            b.setLote(null);
            bovinoRepository.save(b);
        });
    }

    public Bovino actualizarObservaciones(String idBovino, String obs) {
        Bovino bovino = obtenerOFallar(idBovino);
        bovino.setObservaciones(obs);
        return bovinoRepository.save(bovino);
    }
}
