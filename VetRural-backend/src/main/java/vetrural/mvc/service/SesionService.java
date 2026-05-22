package vetrural.mvc.service;

import vetrural.mvc.entity.Sesion;

import java.util.List;

public interface SesionService {
    Sesion crear(Long veterinarioId, String anotador, Long establecimientoId);
    Sesion obtenerOFallar(Long id);
    List<Sesion> listarPorEstablecimiento(Long establecimientoId);
}
