import { QuizQuestion } from '../types/motherboard';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // EASY - Identification & Core Concepts
  {
    id: 'q1',
    difficulty: 'easy',
    type: 'identify_3d',
    question: 'Where is the CPU Socket located? Click on the physical socket that holds the processor.',
    scenario: 'You are starting a new PC build and need to install your Intel/AMD processor onto the motherboard.',
    targetComponentId: 'cpu_socket',
    explanation: 'The CPU Socket is the central LGA/PGA grid equipped with a metal retention bracket where the processor is seated.',
    category: 'processing'
  },
  {
    id: 'q2',
    difficulty: 'easy',
    type: 'identify_3d',
    question: 'Click on the RAM / DIMM Slots where system memory sticks are installed.',
    scenario: 'You purchased a 32GB DDR5 dual-channel kit and need to insert the memory modules.',
    targetComponentId: 'ram_slots',
    explanation: 'The RAM slots are the tall vertical slots located immediately to the right of the CPU socket, featuring locking latches on the ends.',
    category: 'memory'
  },
  {
    id: 'q3',
    difficulty: 'easy',
    type: 'identify_3d',
    question: 'Click on the primary PCIe x16 slot used for installing a dedicated graphics card (GPU).',
    scenario: 'You want to install a GeForce RTX or Radeon RX graphics card for high-end 3D gaming.',
    targetComponentId: 'pcie_x16_primary',
    explanation: 'The primary PCIe x16 slot is the reinforced, full-length top expansion slot wired directly to the CPU for maximum bandwidth.',
    category: 'expansion'
  },
  {
    id: 'q4',
    difficulty: 'easy',
    type: 'multiple_choice',
    question: 'What is the primary function of the CMOS 3V Coin Battery (CR2032)?',
    options: [
      'Powers the cooling fans when the PC is asleep',
      'Maintains the Real-Time Clock (date/time) and BIOS settings when AC power is disconnected',
      'Provides emergency backup power to the graphics card during gaming',
      'Charges the internal M.2 SSD cache memory'
    ],
    correctOptionIndex: 1,
    explanation: 'The 3V lithium coin cell provides micro-power to the Real-Time Clock (RTC) chip and volatile BIOS registers so your PC doesn’t lose its time and hardware settings when unplugged.',
    category: 'firmware'
  },
  {
    id: 'q5',
    difficulty: 'easy',
    type: 'identify_3d',
    question: 'Click on the 24-Pin ATX Main Power Connector that supplies system power from the PSU.',
    scenario: 'You are plugging the thickest multi-colored wiring harness from your power supply into the motherboard.',
    targetComponentId: 'atx_24pin_power',
    explanation: 'The 24-pin ATX connector is the large keyed rectangular socket located along the rightmost edge of the motherboard PCB.',
    category: 'power'
  },
  {
    id: 'q6',
    difficulty: 'easy',
    type: 'identify_3d',
    question: 'Click on the M.2 NVMe Slot / Thermal Shield where high-speed stick SSDs are mounted.',
    scenario: 'You want to install an ultra-fast Gen 5 NVMe SSD directly to the motherboard.',
    targetComponentId: 'm2_slot_1',
    explanation: 'The primary M.2 slot is located between the CPU socket and the PCIe x16 slot, covered by an aluminum thermal heatsink shield.',
    category: 'storage'
  },
  {
    id: 'q7',
    difficulty: 'easy',
    type: 'multiple_choice',
    question: 'What does "VRM" stand for on a computer motherboard?',
    options: [
      'Virtual RAM Memory',
      'Voltage Regulator Module',
      'Variable Resistor Matrix',
      'Visual Rendering Microchip'
    ],
    correctOptionIndex: 1,
    explanation: 'VRM stands for Voltage Regulator Module. It transforms high 12V DC input from the power supply down into clean, precise 0.7V - 1.4V required by the CPU.',
    category: 'power'
  },
  {
    id: 'q8',
    difficulty: 'easy',
    type: 'identify_3d',
    question: 'Click on the VRM Heatsink Armor that dissipates heat from the CPU power delivery stages.',
    scenario: 'The CPU is running a heavy 3D render and drawing 200W; these aluminum blocks dissipate the heat from the power MOSFETs.',
    targetComponentId: 'vrm_heatsink',
    explanation: 'The VRM Heatsinks are the large, heavy finned aluminum blocks surrounding the top and left sides of the CPU socket.',
    category: 'cooling'
  },

  // MEDIUM - Functionality & Troubleshooting
  {
    id: 'q9',
    difficulty: 'medium',
    type: 'identify_3d',
    question: 'Click on the 2-Digit 7-Segment POST Code Display / EZ Debug LEDs used to diagnose startup failures.',
    scenario: 'Your new PC turns on and fans spin, but there is no display on the monitor. You check this component for an error code.',
    targetComponentId: 'debug_leds',
    explanation: 'The Debug Display & LEDs show hexadecimal checkpoint codes (like code "55" for memory failure) and light up CPU/DRAM/VGA/BOOT indicators.',
    category: 'firmware'
  },
  {
    id: 'q10',
    difficulty: 'medium',
    type: 'multiple_choice',
    question: 'When installing 2 RAM sticks on a 4-slot motherboard, which slots should usually be populated first for optimal signal integrity?',
    options: [
      'Slots 1 and 2 (A1 and A2)',
      'Slots 1 and 3 (A1 and B1)',
      'Slots 2 and 4 (A2 and B2)',
      'Slots 3 and 4 (B1 and B2)'
    ],
    correctOptionIndex: 2,
    explanation: 'On modern daisy-chain motherboard trace topologies, slots 2 and 4 (A2 and B2) are at the physical ends of the copper traces, preventing signal reflections and ensuring maximum memory overclocking stability.',
    category: 'memory'
  },
  {
    id: 'q11',
    difficulty: 'medium',
    type: 'identify_3d',
    question: 'Click on the 8-Pin CPU EPS 12V Power Connector located at the top-left of the board.',
    scenario: 'You need to supply dedicated +12V power strictly for the CPU voltage regulators.',
    targetComponentId: 'eps_8pin_power',
    explanation: 'The 8-pin EPS 12V connector is positioned in the upper-left corner above the VRM heatsink to deliver dedicated, isolated power to the CPU.',
    category: 'power'
  },
  {
    id: 'q12',
    difficulty: 'medium',
    type: 'multiple_choice',
    question: 'Why does the motherboard have an electrically isolated PCB section with a physical isolation cut line near the bottom left?',
    options: [
      'To prevent water damage from spilling drinks',
      'To isolate analog audio signals from electromagnetic noise generated by the GPU and VRM',
      'To allow the motherboard to flex without cracking the solder joints',
      'To provide a separate ground plane for the Wi-Fi antennas'
    ],
    correctOptionIndex: 1,
    explanation: 'The isolated audio PCB strip separates sensitive analog audio traces and the DAC codec from high-frequency switching EMI created by the graphics card and VRM power stages, preventing audible buzzing and static in headphones.',
    category: 'audio'
  },
  {
    id: 'q13',
    difficulty: 'medium',
    type: 'identify_3d',
    question: 'Click on the Chipset / PCH (Platform Controller Hub) that manages peripheral I/O and SATA ports.',
    scenario: 'This secondary silicon chip coordinates USB traffic, SATA drives, Ethernet, and secondary PCIe slots.',
    targetComponentId: 'chipset',
    explanation: 'The Chipset (PCH) is located on the lower-right area of the motherboard underneath a stylized passive aluminum heatsink.',
    category: 'firmware'
  },
  {
    id: 'q14',
    difficulty: 'medium',
    type: 'multiple_choice',
    question: 'What happens if you plug a 3-pin 5V Addressable RGB (ARGB) device into a 4-pin 12V RGB header?',
    options: [
      'The LEDs will light up brighter than normal',
      'The LEDs will permanently burn out / get damaged due to 12V overvoltage',
      'The motherboard will automatically step down the voltage to 5V',
      'The lights will simply blink red to indicate a warning'
    ],
    correctOptionIndex: 1,
    explanation: 'ARGB devices are rated strictly for 5V digital logic. Connecting them to a 12V analog header delivers more than double the rated voltage, instantly destroying the WS2812B micro-LED controllers.',
    category: 'io'
  },
  {
    id: 'q15',
    difficulty: 'medium',
    type: 'identify_3d',
    question: 'Click on the Front Panel Header (F_PANEL) where the PC case Power and Reset buttons plug in.',
    scenario: 'You need to connect the power switch wires from the front of your PC case so pressing the power button turns on the computer.',
    targetComponentId: 'front_panel_header',
    explanation: 'The Front Panel header is the 9-pin cluster in the bottom-right corner connecting PWR_SW, RESET_SW, HDD_LED, and PWR_LED.',
    category: 'io'
  },
  {
    id: 'q16',
    difficulty: 'medium',
    type: 'identify_3d',
    question: 'Click on the solid capacitors that store electrical charge and smooth out voltage ripples for the CPU.',
    scenario: 'These black metallic cylindrical components act like high-speed energy buffers right next to the VRM.',
    targetComponentId: 'capacitors',
    explanation: 'Solid conductive polymer capacitors are the cylindrical metallic cans arrayed along the VRM phases that filter voltage ripples and handle sudden CPU boost current demands.',
    category: 'power'
  },

  // HARD - Electrical Engineering & High-End Architecture
  {
    id: 'q17',
    difficulty: 'hard',
    type: 'multiple_choice',
    question: 'What is the primary technical reason why high-speed DDR5 memory traces on a motherboard are routed in serpentine "snake" zig-zag shapes?',
    options: [
      'To look visually appealing through transparent PC case glass panels',
      'To achieve exact trace length matching so all parallel data bits arrive simultaneously with sub-picosecond skew',
      'To increase electrical resistance and prevent excessive current draw',
      'To radiate heat away from the copper traces more effectively'
    ],
    correctOptionIndex: 1,
    explanation: 'At gigahertz frequencies, electrical signals travel down copper traces at approximately 15 cm per nanosecond. Serpentine routing ensures every trace in a memory channel has the exact same physical length down to fractions of a millimeter, eliminating bit skew.',
    category: 'memory'
  },
  {
    id: 'q18',
    difficulty: 'hard',
    type: 'identify_3d',
    question: 'Click on the Alloy Chokes (Inductors) that store energy magnetically in the VRM buck converter phases.',
    scenario: 'These square ferrite blocks stamped with "R33" or "1R0" resist abrupt current spikes and smooth the switched DC voltage.',
    targetComponentId: 'chokes',
    explanation: 'Power chokes are the square molded ferrite alloy inductors situated between the MOSFET power stages and the CPU socket.',
    category: 'power'
  },
  {
    id: 'q19',
    difficulty: 'hard',
    type: 'multiple_choice',
    question: 'What is the total theoretical bidirectional bandwidth of a full PCIe 5.0 x16 expansion slot?',
    options: [
      '16 GB/s',
      '32 GB/s',
      '64 GB/s',
      '128 GB/s'
    ],
    correctOptionIndex: 3,
    explanation: 'PCIe 5.0 operates at 32 GT/s with 128b/130b encoding, delivering roughly 3.94 GB/s per lane. Across 16 lanes, this equals ~63 GB/s in each direction, or 128 GB/s total bidirectional bandwidth.',
    category: 'expansion'
  },
  {
    id: 'q20',
    difficulty: 'hard',
    type: 'identify_3d',
    question: 'Click on the external Clock Generator IC responsible for generating ultra-low-jitter 100MHz reference pulses.',
    scenario: 'This dedicated synthesizer allows overclockers to modify the BCLK base clock frequency independently of PCIe bus locks.',
    targetComponentId: 'clock_generator',
    explanation: 'The external clock generator is a compact microchip paired with a quartz crystal oscillator that synthesizes low-jitter reference clock frequencies.',
    category: 'firmware'
  }
];
