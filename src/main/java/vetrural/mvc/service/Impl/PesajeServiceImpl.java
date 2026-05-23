package vetrural.mvc.service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vetrural.mvc.entity.Bovino;
import vetrural.mvc.entity.Pesaje;
import vetrural.mvc.entity.Usuario;
import vetrural.mvc.repository.PesajeRepository;
import vetrural.mvc.service.PesajeService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PesajeServiceImpl implements PesajeService {

    @Autowired
    private PesajeRepository pesajeRepository;

    @Override
    public Pesaje registrarPesaje(Bovino bovino, Usuario registradoPor, double peso) {
        if (peso <= 0) {
            throw new IllegalArgumentException("El peso debe ser un valor positivo");
        }
        Pesaje pesaje = new Pesaje();
        pesaje.setBovino(bovino);
        pesaje.setRegistradoPor(registradoPor);
        pesaje.setFechaHora(LocalDateTime.now());
        pesaje.setPeso(peso);
        return pesajeRepository.save(pesaje);
    }

    @Override
    public List<Pesaje> getPesajesPorBovino(Bovino bovino) {
        return pesajeRepository.findByBovino(bovino);
    }

    @Override
    public Optional<Pesaje> getUltimoPesaje(Bovino bovino) {
        return pesajeRepository.findTopByBovinoOrderByFechaHoraDesc(bovino);
    }

    @Override
    public List<Pesaje> listarPesajes() {
        return pesajeRepository.findAll();
    }
}
