package vetrural.mvc.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Pesaje")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter

public class Pesaje extends EventoSanitario {
    @Column(nullable = false)
    private double peso;
}
