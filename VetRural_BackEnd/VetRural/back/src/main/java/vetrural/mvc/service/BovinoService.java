package vetrural.mvc.service;

import vetrural.mvc.dto.response.HistorialBovinoResponse;
import vetrural.mvc.entity.Bovino;
import vetrural.mvc.enumerations.EstadoBovinoEnum;
import vetrural.mvc.enumerations.RazaBovinoEnum;
import vetrural.mvc.enumerations.SexoEnum;
import vetrural.mvc.enumerations.TipoBovinoEnum;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BovinoService {
    Bovino crearBovino(String caravana, Long establecimientoId, LocalDate nacimiento, SexoEnum sexo, String obs, String apodo, RazaBovinoEnum raza, TipoBovinoEnum tipo);
    Bovino crearBovinoRapido(String caravana, Long establecimientoId, SexoEnum sexo);
    Bovino actualizarBovino(Long id, String caravana, Long establecimientoId, LocalDate nacimiento, SexoEnum sexo, String lote, RazaBovinoEnum raza, TipoBovinoEnum tipo, String obs, String apodo);
    void eliminarBovino(Long id);
    Bovino darBaja(Long id, EstadoBovinoEnum estado, String motivoBaja);
    boolean existePorCaravana(String caravana);
    Optional<Bovino> getBovino(Long id);
    Optional<Bovino> getBovinoPorCaravana(String caravana);
    Bovino obtenerOFallar(Long id);
    Bovino obtenerOFallarPorCaravana(String caravana);
    List<Bovino> listarBovinos();
    List<Bovino> listarBovinosPorLote(String lote);
    List<Bovino> listarBovinosPorEstablecimiento(Long establecimientoId);
    List<Bovino> listarBajasPorEstablecimiento(Long establecimientoId);
    List<String> getLotes();
    void crearLote(String nombre, List<Long> idBovinos);
    void anadirBovinoALote(Long idBovino, String nombreLote);
    void eliminarLote(String nombreLote);
    Bovino actualizarObservaciones(Long idBovino, String obs);
    HistorialBovinoResponse getHistorial(String caravana);
}
