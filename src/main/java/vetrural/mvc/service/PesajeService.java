package vetrural.mvc.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vetrural.mvc.entity.Pesaje;
import vetrural.mvc.repository.PesajeRepository;
import java.util.List;

@Service
public class PesajeService {

    @Autowired
    private PesajeRepository pesajeRepository;

    public Pesaje registrarPesaje(String idBovino, float peso) { // Registra un nuevo pesaje para un bovino y lo guarda en SQL
        if (peso <= 0) {
            throw new IllegalArgumentException("El peso debe ser un valor positivo");
        }
        if (idBovino == null || idBovino.trim().isEmpty()) {
            throw new IllegalArgumentException("El ID del bovino no puede ser nulo o vacío");
        }
        Pesaje pesaje = new Pesaje();
        pesaje.setIdBovino(idBovino);
        pesaje.setPeso(peso);
        return pesajeRepository.save(pesaje);
    }

    public List<Pesaje> getPesajesPorBovino(String idBovino) { // Obtiene la lista de pesajes de un bovino específico por su ID
        return pesajeRepository.findByIdBovino(idBovino);
    }

    public List<Pesaje> listarPesajes() { // Obtiene la lista de todos los pesajes registrados en SQL
        return pesajeRepository.findAll();
    }
}
