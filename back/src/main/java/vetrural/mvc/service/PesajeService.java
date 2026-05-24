package vetrural.mvc.service;

import vetrural.mvc.entity.Bovino;
import vetrural.mvc.entity.Pesaje;
import vetrural.mvc.entity.Usuario;
import java.util.List;
import java.util.Optional;

public interface PesajeService {
    Pesaje registrarPesaje(Bovino bovino, Usuario registradoPor, double peso);
    List<Pesaje> getPesajesPorBovino(Bovino bovino);
    Optional<Pesaje> getUltimoPesaje(Bovino bovino);
    List<Pesaje> listarPesajes();
}
