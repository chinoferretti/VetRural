package vetrural.mvc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vetrural.mvc.entity.Bovino;
import java.util.List;

@Repository
public interface BovinoRepository extends JpaRepository<Bovino, String> {
    List<Bovino> findByLote(String lote); // Busca bovinos por lote
    List<Bovino> findBySexo(String sexo); // Busca bovinos por sexo
    List<Bovino> findByRaza(String raza); // Busca bovinos por raza
    List<Bovino> findByTipo(String tipo); // Busca bovinos por tipo
}
