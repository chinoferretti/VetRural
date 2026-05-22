package vetrural.mvc.service;

import vetrural.mvc.entity.Bovino;
import vetrural.mvc.entity.Pesaje;
import vetrural.mvc.entity.Sesion;
import java.util.List;
import java.util.Optional;

public interface PesajeService {
    Pesaje registrarPesaje(Bovino bovino, Sesion sesion, double peso);
    List<Pesaje> getPesajesPorBovino(Bovino bovino);
    Optional<Pesaje> getUltimoPesaje(Bovino bovino);
    List<Pesaje> listarPesajes();
}
