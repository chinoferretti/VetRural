package vetrural.mvc.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MetricasResponse {
    private int totalBovinos;
    private int hembras;
    private int machos;
    private Integer edadPromedioMeses;
    private Double pesoPromedio;
    private int conPeso;
    private int prenadas;
    private int totalTactadas;
    private int porcentajePrenez;
    private Map<String, Integer> vacunados;   // nombre enum → cantidad bovinos vacunados
    private List<String> lotes;
}
