// Demo data for showcasing the application
export const demoData = {
  // Define Phase
  problemStatement: "Customer complaints about order fulfillment times have increased by 35% over the past 3 months, resulting in decreased customer satisfaction scores and potential revenue loss.",
  
  projectGoal: "Reduce average order fulfillment time from 5 days to 2 days within 6 months, improving customer satisfaction scores by at least 20%.",
  
  scope: "This project focuses on the order fulfillment process from order placement to shipment, including warehouse operations, inventory management, and shipping coordination. Out of scope: product manufacturing, customer service responses, and payment processing.",
  
  teamMembers: "Project Lead: Sarah Johnson\nProcess Owner: Mike Chen\nWarehouse Manager: Lisa Rodriguez\nIT Specialist: James Park\nQuality Analyst: Emily Watson",
  
  timeline: "Phase 1 (Define): Weeks 1-2\nPhase 2 (Measure): Weeks 3-6\nPhase 3 (Analyze): Weeks 7-10\nPhase 4 (Improve): Weeks 11-18\nPhase 5 (Control): Weeks 19-24",
  
  sipoc: {
    suppliers: ["Raw material vendors", "Packaging suppliers", "3rd party logistics"],
    inputs: ["Purchase orders", "Inventory data", "Customer shipping addresses", "Packing materials"],
    process: "Order Fulfillment Process",
    outputs: ["Shipped orders", "Tracking numbers", "Delivery confirmations", "Customer notifications"],
    customers: ["Online customers", "Retail partners", "Wholesale distributors"]
  },

  // Measure Phase
  processMaps: [
    {
      processName: "Order Fulfillment Workflow",
      steps: [
        { id: 1, name: "Receive Order", type: "Process", duration: "5 min", responsible: "System" },
        { id: 2, name: "Validate Inventory", type: "Decision", duration: "10 min", responsible: "System" },
        { id: 3, name: "Pick Items", type: "Process", duration: "30 min", responsible: "Warehouse Staff" },
        { id: 4, name: "Quality Check", type: "Process", duration: "15 min", responsible: "QA Team" },
        { id: 5, name: "Pack Order", type: "Process", duration: "20 min", responsible: "Warehouse Staff" },
        { id: 6, name: "Generate Label", type: "Process", duration: "5 min", responsible: "System" },
        { id: 7, name: "Ship Order", type: "Process", duration: "Varies", responsible: "Shipping Partner" }
      ]
    }
  ],

  metrics: [
    {
      id: Date.now() - 3000,
      name: "Average Order Fulfillment Time",
      current: "5.2 days",
      target: "2.0 days",
      unit: "days",
      category: "Time"
    },
    {
      id: Date.now() - 2000,
      name: "Order Accuracy Rate",
      current: "94%",
      target: "99%",
      unit: "%",
      category: "Quality"
    },
    {
      id: Date.now() - 1000,
      name: "Customer Satisfaction Score",
      current: "3.2/5",
      target: "4.5/5",
      unit: "rating",
      category: "Customer"
    }
  ],

  baselineSummary: "Current average fulfillment time is 5.2 days with significant variability (±2 days). Peak order volumes show 40% longer processing times. Manual picking process accounts for 45% of total time. Quality checks reveal 6% error rate requiring rework.",

  // Analyze Phase
  rootCauses: "Root Causes Identified:\n\n1. Inefficient Warehouse Layout\n   - Items frequently picked are stored in distant locations\n   - Picker travel time accounts for 40% of picking duration\n\n2. Manual Inventory Tracking\n   - No real-time inventory updates\n   - Leads to stock discrepancies and order delays\n\n3. Inadequate Staffing During Peak Hours\n   - Fixed staffing model doesn't account for demand fluctuations\n   - Results in bottlenecks during high-volume periods\n\n4. Lack of Process Standardization\n   - Each warehouse staff member follows different procedures\n   - Inconsistent quality and timing",

  dataAnalysis: "Analysis of 3 months of order data reveals:\n- 65% of delays occur during peak hours (10am-2pm)\n- Top 20% of SKUs account for 80% of orders (Pareto principle)\n- Average picker walks 2.3 miles per shift\n- Quality issues concentrated in 3 specific product categories\n- Weekend orders show 25% faster fulfillment times (less congestion)",

  keyFindings: "1. Warehouse layout optimization could reduce picker travel by 60%\n2. Real-time inventory system would eliminate 85% of stock discrepancies\n3. Flexible staffing model could reduce peak-hour bottlenecks by 50%\n4. Standardized procedures could improve consistency by 40%\n5. Automation opportunities identified in packing and labeling",

  fiveWhysResults: [
    {
      problem: "Orders are taking too long to fulfill",
      whys: [
        "Warehouse staff spend excessive time locating items",
        "Warehouse layout doesn't prioritize frequently picked items",
        "No data-driven approach to warehouse organization",
        "Management hasn't invested in layout optimization",
        "Lack of awareness about the impact on fulfillment times"
      ],
      rootCause: "Lack of awareness about the impact on fulfillment times",
      timestamp: new Date().toISOString()
    }
  ],

  fishboneResults: [
    {
      problem: "Long order fulfillment times",
      categories: {
        methods: {
          name: "Methods",
          causes: ["Manual picking process", "No standardized procedures", "Inefficient routing"]
        },
        machines: {
          name: "Machines/Equipment",
          causes: ["Outdated scanning equipment", "No automated sorting", "Limited conveyor system"]
        },
        materials: {
          name: "Materials",
          causes: ["Inconsistent packaging supplies", "Stock discrepancies"]
        },
        measurements: {
          name: "Measurements",
          causes: ["No real-time tracking", "Limited performance metrics", "Delayed reporting"]
        },
        people: {
          name: "People",
          causes: ["Insufficient peak-hour staffing", "Limited cross-training", "High turnover"]
        },
        environment: {
          name: "Environment",
          causes: ["Poor warehouse lighting", "Suboptimal temperature control", "Cluttered work areas"]
        }
      },
      rootCause: "Combination of inefficient warehouse layout and inadequate real-time inventory tracking system",
      timestamp: new Date().toISOString()
    }
  ],

  processWastes: {
    "Order Fulfillment Workflow-3": [
      {
        id: Date.now() - 5000,
        description: "Excessive walking - employees travel 2+ miles per shift",
        severity: "High"
      },
      {
        id: Date.now() - 4000,
        description: "Waiting for inventory confirmations due to manual checks",
        severity: "Medium"
      }
    ],
    "Order Fulfillment Workflow-4": [
      {
        id: Date.now() - 3000,
        description: "Defects - 6% of orders require rework after quality check",
        severity: "High"
      }
    ],
    "Order Fulfillment Workflow-5": [
      {
        id: Date.now() - 2000,
        description: "Motion waste - repetitive reaching for packing materials",
        severity: "Low"
      }
    ]
  },

  wasteRootCauses: {
    [Date.now() - 5000]: "Warehouse layout not optimized for high-velocity items. Fast-moving SKUs located in distant zones requiring excessive travel.",
    [Date.now() - 4000]: "Manual inventory tracking system without real-time updates. Staff must physically verify stock levels.",
    [Date.now() - 3000]: "Lack of standardized quality check procedures. Each staff member uses different criteria leading to inconsistent error detection.",
    [Date.now() - 2000]: "Packing station design places frequently used materials out of ergonomic reach zone. No 5S implementation in packing area."
  },

  // Improve Phase
  improvements: [
    {
      id: Date.now() - 6000,
      title: "Warehouse Layout Reorganization",
      description: "Reorganize warehouse to place high-velocity items in easily accessible locations closer to packing stations",
      expectedImpact: "Reduce picker travel time by 60%, decrease picking duration from 30 to 12 minutes",
      implementation: "Week 12-14: Map current layout, analyze order data, design new layout\nWeek 15-17: Relocate inventory, update system, train staff",
      owner: "Lisa Rodriguez",
      status: "Planned"
    },
    {
      id: Date.now() - 5500,
      title: "Real-Time Inventory Management System",
      description: "Implement cloud-based inventory tracking system with barcode scanning for real-time stock updates",
      expectedImpact: "Eliminate 85% of stock discrepancies, reduce validation time from 10 to 2 minutes",
      implementation: "Week 11-13: System selection and procurement\nWeek 14-16: Installation and configuration\nWeek 17-18: Staff training and go-live",
      owner: "James Park",
      status: "Planned"
    },
    {
      id: Date.now() - 5000,
      title: "Flexible Staffing Model",
      description: "Implement data-driven staffing model with part-time staff for peak hours",
      expectedImpact: "Reduce peak-hour bottlenecks by 50%, improve overall throughput by 35%",
      implementation: "Week 15-16: Hire and train part-time staff\nWeek 17-18: Implement flexible scheduling system",
      owner: "Lisa Rodriguez",
      status: "Planned"
    }
  ],

  // Control Phase
  controls: [
    {
      id: Date.now() - 4000,
      type: "Statistical Process Control",
      description: "Daily tracking of average fulfillment time with control charts. Alert triggers if process exceeds ±1 standard deviation.",
      responsibility: "Warehouse Manager",
      frequency: "Daily"
    },
    {
      id: Date.now() - 3500,
      type: "Process Documentation",
      description: "Standard Operating Procedures (SOPs) for all fulfillment steps. Includes visual work instructions at each station.",
      responsibility: "Process Owner",
      frequency: "Updated Quarterly"
    },
    {
      id: Date.now() - 3000,
      type: "Performance Dashboard",
      description: "Real-time dashboard displaying key metrics: fulfillment time, order accuracy, pending orders, and staff productivity.",
      responsibility: "IT Specialist",
      frequency: "Real-time"
    }
  ],

  monitoringPlan: "Weekly Performance Review:\n- Review control charts for all key metrics\n- Analyze any out-of-control points\n- Identify trends or patterns\n- Document corrective actions taken\n\nMonthly Process Audit:\n- Observe 10 random orders through entire process\n- Verify adherence to SOPs\n- Interview staff for feedback\n- Update procedures as needed\n\nQuarterly Management Review:\n- Present results to leadership\n- Review project ROI\n- Identify opportunities for further improvement\n- Adjust targets if necessary",

  processOwner: "Mike Chen - Process Excellence Manager\nResponsible for ongoing process monitoring and continuous improvement initiatives",

  documentationPlan: "Process Documentation:\n1. Standard Operating Procedures (SOPs) - All process steps documented with visual aids\n2. Training Materials - Video tutorials and quick reference guides\n3. Quality Checklists - Standardized quality check procedures\n4. Troubleshooting Guides - Common issues and resolutions\n\nAll documentation stored in shared drive with version control. Updates communicated via team meetings and email.",

  sustainmentStrategy: "1. Monthly Training Refreshers - Keep staff updated on processes\n2. Continuous Improvement Team - Regular kaizen events to identify further improvements\n3. Recognition Program - Reward employees who suggest process improvements\n4. Regular Audits - Ensure continued adherence to improved processes\n5. Technology Updates - Keep systems current with latest features\n6. Benchmarking - Compare performance against industry standards\n7. Customer Feedback Integration - Use customer insights to drive improvements"
};
