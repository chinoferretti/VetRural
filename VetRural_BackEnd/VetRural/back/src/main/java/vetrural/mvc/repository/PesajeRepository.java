package vetrural.mvc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vetrural.mvc.entity.Bovino;
import vetrural.mvc.entity.Pesaje;
import java.util.List;
import java.util.Optional;

@Repository
public interface PesajeRepository extends JpaRepository<Pesaje, Long> {
    List<Pesaje> findByBovino(Bovino bovino);
    Optional<Pesaje> findTopByBovinoOrderByFechaHoraDesc(Bovino bovino);

    @Query("SELECT p FROM Pesaje p WHERE p.bovino.establecimiento.id = :estId " +
           "AND p.fechaHora = (SELECT MAX(p2.fechaHora) FROM Pesaje p2 WHERE p2.bovino = p.bovino)")
    List<Pesaje> findUltimosPorEstablecimiento(@Param("estId") Long estId);
}
