package vetrural.mvc.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Pesaje")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

public class Pesaje {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPesaje;

    private String idBovino;
    private float peso;
}
