package vetrural.mvc.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vetrural.mvc.entity.Bovino;
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

    public Bovino crearBovino(String id, LocalDate nacimiento, SexoEnum sexo, String obs, RazaBovinoEnum raza, TipoBovinoEnum tipo) { // Registra un nuevo bovino con todos sus datos y lo guarda en SQL
        Bovino bovino = new Bovino();
        bovino.setIdAnimal(id);
        bovino.setNacimiento(nacimiento);
        bovino.setSexo(sexo);
        bovino.setObservaciones(obs);
        bovino.setRaza(raza);
        bovino.setTipo(tipo);
        return bovinoRepository.save(bovino);
    }

    public Bovino crearBovinoRapido(String id, SexoEnum sexo) { // Registra un nuevo bovino con solo ID y sexo, dejando el resto de los campos nulos, y lo guarda en SQL
        Bovino bovino = new Bovino();
        bovino.setIdAnimal(id);
        bovino.setNacimiento(null);
        bovino.setSexo(sexo);
        bovino.setObservaciones(null);
        bovino.setRaza(null);
        bovino.setTipo(null);
        return bovinoRepository.save(bovino);
    }

    public void editarBovino(String id, LocalDate nacimiento, SexoEnum sexo, String obs, RazaBovinoEnum raza, TipoBovinoEnum tipo) { // Edita los datos de un bovino existente por su ID y lo actualiza en SQL
        Bovino bovino = bovinoRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Bovino no encontrado: " + id));
        bovino.setNacimiento(nacimiento);
        bovino.setSexo(sexo);
        bovino.setObservaciones(obs);
        bovino.setRaza(raza);
        bovino.setTipo(tipo);
        bovinoRepository.save(bovino);
    }

    public void eliminarBovino(String id) { // Elimina un bovino por su ID de SQL
        bovinoRepository.deleteById(id);
    }

    public boolean existeBovino(String idBovino) { // Verifica si un bovino existe por su ID
        return bovinoRepository.existsById(idBovino);
    }

    public Optional<Bovino> getBovino(String idBovino) { // Obtiene un bovino por su ID, devolviendo un Optional para manejar la posibilidad de que no exista
        return bovinoRepository.findById(idBovino);
    }

    public List<Bovino> listarBovinos() { // Obtiene la lista de todos los bovinos registrados en SQL
        return bovinoRepository.findAll();
    }

    public List<Bovino> listarBovinosPorLote(String lote) { // Obtiene la lista de bovinos que pertenecen a un lote específico por el nombre del lote
        return bovinoRepository.findByLote(lote);
    }

    // Podemos agregar mas formas de listarlos (metodos ya en el repositorio)

    public List<String> getLotes() { // Obtiene la lista de todos los lotes disponibles
        return bovinoRepository.findAll().stream()
                .map(Bovino::getLote)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
    }

    public void crearLote(String nombre, List<String> idBovinos) { // Crea un nuevo lote con un nombre específico y asigna una lista de bovinos a ese lote, actualizando el campo "lote" de cada bovino en SQL
        idBovinos.forEach(id -> bovinoRepository.findById(id).ifPresent(b -> {
            b.setLote(nombre);
            bovinoRepository.save(b);
        }));
    }

    public void anadirBovinoALote(String idBovino, String nombreLote) { // Agrega un bovino a un lote existente por el ID del bovino
        bovinoRepository.findById(idBovino).ifPresent(b -> {
            b.setLote(nombreLote);
            bovinoRepository.save(b);
        });
    }

    public void eliminarLote(String nombreLote) { // Elimina un lote por su nombre, estableciendo el campo "lote" de los bovinos que pertenecen a ese lote como null en SQL
        bovinoRepository.findByLote(nombreLote).forEach(b -> {
            b.setLote(null);
            bovinoRepository.save(b);
        }); // Establece el lote de los bovinos que pertenecian a ese lote a null
    }

    public Bovino actualizarObservaciones(String idBovino, String obs) { // Actualiza las observaciones de un bovino por su ID y lo guarda en SQL
        Bovino bovino = bovinoRepository.findById(idBovino)
                .orElseThrow(() -> new IllegalArgumentException("Bovino no encontrado: " + idBovino));
        bovino.setObservaciones(obs);
        return bovinoRepository.save(bovino);
    }
}
