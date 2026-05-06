package vetrural.mvc.entity;

import java.time.LocalDate;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Vacunacion")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

public class Vacunacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idVacunacion;

    private String idBovino;
    
    private LocalDate aftosa;
    private LocalDate brucelosis;
    private LocalDate carbunco;
    private LocalDate clostridial;
    private LocalDate ibr_bvd;
}
