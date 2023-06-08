/* ************************************ */
/* Define helper functions */
/* ************************************ */
function addID() {
  jsPsych.data.addDataToLastTrial({
    exp_id: "shape_matching_with_spatial_task_switching__practice",
  });
}

function assessPerformance() {
  var experiment_data = jsPsych.data.getTrialsOfType("poldrack-single-stim");
  var missed_count = 0;
  var trial_count = 0;
  var rt_array = [];
  var rt = 0;
  var correct = 0;

  //record choices participants made
  var choice_counts = {};
  choice_counts[-1] = 0;
  choice_counts[77] = 0;
  choice_counts[90] = 0;
  for (var k = 0; k < possible_responses.length; k++) {
    choice_counts[possible_responses[k][1]] = 0;
  }
  for (var i = 0; i < experiment_data.length; i++) {
    if (experiment_data[i].trial_id == "test_trial") {
      trial_count += 1;
      rt = experiment_data[i].rt;
      key = experiment_data[i].key_press;
      choice_counts[key] += 1;
      if (rt == -1) {
        missed_count += 1;
      } else {
        rt_array.push(rt);
      }

      if (key == experiment_data[i].correct_response) {
        correct += 1;
      }
    }
  }

  //calculate average rt
  var avg_rt = -1;
  if (rt_array.length !== 0) {
    avg_rt = math.median(rt_array);
  }
  //calculate whether response distribution is okay
  var responses_ok = true;
  Object.keys(choice_counts).forEach(function (key, index) {
    if (choice_counts[key] > trial_count * 0.85) {
      responses_ok = false;
    }
  });
  var missed_percent = missed_count / trial_count;
  var accuracy = correct / trial_count;
  credit_var =
    missed_percent < 0.25 && avg_rt > 200 && responses_ok && accuracy > 0.6;
  jsPsych.data.addDataToLastTrial({
    final_credit_var: credit_var,
    final_missed_percent: missed_percent,
    final_avg_rt: avg_rt,
    final_responses_ok: responses_ok,
    final_accuracy: accuracy,
  });
}

var getInstructFeedback = function () {
  return (
    "<div class = centerbox><p class = center-block-text>" +
    feedback_instruct_text +
    "</p></div>"
  );
};

var getFeedback = function () {
  return (
    '<div class = bigbox><div class = picture_box><p class = block-text><font color="white">' +
    feedback_text +
    "</font></p></div></div>"
  );
};

var randomDraw = function (lst) {
  var index = Math.floor(Math.random() * lst.length);
  return lst[index];
};

//added for spatial task
var makeTaskSwitches = function (numTrials) {
  task_switch_arr = [
    "tstay_cstay",
    "tstay_cswitch",
    "tswitch_cswitch",
    "tswitch_cswitch",
  ];

  out = jsPsych.randomization.repeat(task_switch_arr, numTrials / 4);
  return out;
};

//added for spatial task
var getQuad = function (oldQuad, curr_switch) {
  var out;
  switch (curr_switch) {
    case "tstay_cstay":
      out = oldQuad;
      break;
    case "tstay_cswitch":
      if (oldQuad % 2 == 0) {
        // if even (2,4), subtract 1
        out = oldQuad - 1;
      } else {
        out = oldQuad + 1; //if odd (1,3), add 1
      }
      break;
    case "tswitch_cswitch":
      if (oldQuad < 3) {
        //if in top quadrants (1,2)
        out = Math.ceil(Math.random() * 2) + 2; // should return 3 or 4
      } else {
        //if in bottom quadrants (3,4)
        out = Math.ceil(Math.random() * 2); // should return 1 or 2
      }
      break;
  }
  return out;
};

var createTrialTypes = function (task_switches, numTrialsPerBlock) {
  var whichQuadStart = jsPsych.randomization.repeat([1, 2, 3, 4], 1).pop();
  var predictable_cond_array = predictable_conditions[whichQuadStart % 2];
  predictable_dimensions = predictable_dimensions_list[0];
  console.log(predictable_cond_array);
  var shape_matching_trial_type_list = [];
  var shape_matching_trial_types1 = jsPsych.randomization.repeat(
    shape_matching_conditions,
    numTrialsPerBlock / numConds
  );
  var shape_matching_trial_types2 = jsPsych.randomization.repeat(
    shape_matching_conditions,
    numTrialsPerBlock / numConds
  );
  var shape_matching_trial_types3 = jsPsych.randomization.repeat(
    shape_matching_conditions,
    numTrialsPerBlock / numConds
  );
  var shape_matching_trial_types4 = jsPsych.randomization.repeat(
    shape_matching_conditions,
    numTrialsPerBlock / numConds
  );
  shape_matching_trial_type_list.push(shape_matching_trial_types1);
  shape_matching_trial_type_list.push(shape_matching_trial_types2);
  shape_matching_trial_type_list.push(shape_matching_trial_types3);
  shape_matching_trial_type_list.push(shape_matching_trial_types4);

  shape_matching_condition = jsPsych.randomization
    .repeat(shape_matching_conditions, 1)
    .pop();
  predictable_dimension = predictable_dimensions[whichQuadStart - 1];

  var probe_i = randomDraw([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  var target_i = 0;
  var distractor_i = 0;
  if (shape_matching_condition[0] == "S") {
    target_i = probe_i;
    if (predictable_dimension == "the same") {
      correct_response = possible_responses[0][1];
    } else {
      correct_response = possible_responses[1][1];
    }
  } else {
    target_i = randomDraw(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(function (y) {
        return y != probe_i;
      })
    );
    if (predictable_dimension == "the same") {
      correct_response = possible_responses[1][1];
    } else {
      correct_response = possible_responses[0][1];
    }
  }

  if (shape_matching_condition[1] == "S") {
    distractor_i = target_i;
  } else if (shape_matching_condition[2] == "S") {
    distractor_i = probe_i;
  } else if (shape_matching_condition[2] == "D") {
    distractor_i = randomDraw(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(function (y) {
        return $.inArray(y, [target_i, probe_i]) == -1;
      })
    );
  } else if (shape_matching_condition[2] == "N") {
    distractor_i = "none";
  }

  var stims = [];

  var first_stim = {
    whichQuad: whichQuadStart,
    predictable_condition: "N/A",
    predictable_dimension: predictable_dimension,
    shape_matching_condition: shape_matching_condition,
    probe: probe_i,
    target: target_i,
    distractor: distractor_i,
    correct_response: correct_response,
  };
  stims.push(first_stim);

  oldQuad = whichQuadStart;
  for (var i = 0; i < task_switches.length; i++) {
    whichQuadStart += 1;
    quadIndex = whichQuadStart % 4;
    if (quadIndex === 0) {
      quadIndex = 4;
    }
    shape_matching_condition =
      shape_matching_trial_type_list[quadIndex - 1].pop();
    quadIndex = getQuad(oldQuad, task_switches[i]);
    predictable_dimension = predictable_dimensions[quadIndex - 1];
    probe_i = randomDraw([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    target_i = 0;
    distractor_i = 0;
    if (shape_matching_condition[0] == "S") {
      target_i = probe_i;
      if (predictable_dimension == "the same") {
        correct_response = possible_responses[0][1];
      } else {
        correct_response = possible_responses[1][1];
      }
    } else {
      target_i = randomDraw(
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(function (y) {
          return y != probe_i;
        })
      );
      if (predictable_dimension == "the same") {
        correct_response = possible_responses[1][1];
      } else {
        correct_response = possible_responses[0][1];
      }
    }

    if (shape_matching_condition[1] == "S") {
      distractor_i = target_i;
    } else if (shape_matching_condition[2] == "S") {
      distractor_i = probe_i;
    } else if (shape_matching_condition[2] == "D") {
      distractor_i = randomDraw(
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(function (y) {
          return $.inArray(y, [target_i, probe_i]) == -1;
        })
      );
    } else if (shape_matching_condition[2] == "N") {
      distractor_i = "none";
    }
    stim = {
      whichQuad: quadIndex,
      predictable_condition: predictable_cond_array[i % 2],
      predictable_dimension: predictable_dimension,
      shape_matching_condition: shape_matching_condition,
      probe: probe_i,
      target: target_i,
      distractor: distractor_i,
      correct_response: correct_response,
    };

    stims.push(stim);

    oldQuad = quadIndex;
  }

  return stims;
};

var getResponse = function () {
  return correct_response;
};

var getStim = function () {
  if (shape_matching_condition == "SNN" || shape_matching_condition == "DNN") {
    return (
      task_boards[whichQuadrant - 1][0] +
      preFileType +
      target +
      "_green" +
      fileTypePNG +
      task_boards[whichQuadrant - 1][1] +
      task_boards[whichQuadrant - 1][2] +
      preFileType +
      probe +
      "_white" +
      fileTypePNG +
      task_boards[whichQuadrant - 1][3]
    );
  } else {
    return (
      task_boards[whichQuadrant - 1][0] +
      preFileType +
      target +
      "_green" +
      fileTypePNG +
      task_boards[whichQuadrant - 1][1] +
      preFileType +
      distractor +
      "_red" +
      fileTypePNG +
      task_boards[whichQuadrant - 1][2] +
      preFileType +
      probe +
      "_white" +
      fileTypePNG +
      task_boards[whichQuadrant - 1][3]
    );
  }
};

var getMask = function () {
  stim = stims.shift(); //stims = [] at initial stage
  predictable_condition = stim.predictable_condition;
  predictable_dimension = stim.predictable_dimension;
  shape_matching_condition = stim.shape_matching_condition;
  probe = stim.probe;
  target = stim.target;
  distractor = stim.distractor;
  correct_response = stim.correct_response;
  whichQuadrant = stim.whichQuad;

  return (
    mask_boards[whichQuadrant - 1][0] +
    preFileType +
    "mask" +
    fileTypePNG +
    "<div class = centerbox><div class = fixation>+</div></div>" +
    mask_boards[whichQuadrant - 1][1] +
    preFileType +
    "mask" +
    fileTypePNG +
    "<div class = centerbox><div class = fixation>+</div></div>" +
    mask_boards[whichQuadrant - 1][2]
  );
};

var getFixation = function () {
  stim = stims.shift(); //stims = [] at initial stage
  predictable_condition = stim.predictable_condition;
  predictable_dimension = stim.predictable_dimension;
  shape_matching_condition = stim.shape_matching_condition;
  probe = stim.probe;
  target = stim.target;
  distractor = stim.distractor;
  correct_response = stim.correct_response;
  whichQuadrant = stim.whichQuad;

  return "<div class = centerbox><div class = fixation>+</div></div>"; //changed for spatial
};

var appendData = function () {
  curr_trial = jsPsych.progress().current_trial_global;
  trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id;
  current_trial += 1;

  task_switch = "na";
  if (current_trial > 1) {
    task_switch = task_switches[current_trial - 2]; //this might be off
  }

  if (trial_id == "practice_trial") {
    current_block = practiceCount;
  } else if (trial_id == "test_trial") {
    current_block = testCount;
  }

  jsPsych.data.addDataToLastTrial({
    predictable_condition: predictable_condition,
    predictable_dimension: predictable_dimension,
    task_switch: task_switch,
    shape_matching_condition: shape_matching_condition,
    probe: probe,
    target: target,
    distractor: distractor,
    correct_response: correct_response,
    whichQuadrant: whichQuadrant,
    current_trial: current_trial,
  });

  if (
    jsPsych.data.getDataByTrialIndex(curr_trial).key_press == correct_response
  ) {
    jsPsych.data.addDataToLastTrial({
      correct_trial: 1,
    });
  } else if (
    jsPsych.data.getDataByTrialIndex(curr_trial).key_press != correct_response
  ) {
    jsPsych.data.addDataToLastTrial({
      correct_trial: 0,
    });
  }
};

/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var sumInstructTime = 0; //ms
var instructTimeThresh = 0; ///in seconds
var credit_var = 0;

// task specific variables
// Set up variables for stimuli
var practice_len = 28;
//var exp_len = 280; // must be divisible by 28
//var numTrialsPerBlock = 56; // divisible by 28
//var numTestBlocks = exp_len / numTrialsPerBlock;

var accuracy_thresh = 0.75;
var rt_thresh = 1000;
var missed_thresh = 0.1;
var practice_thresh = 3; //blocks of 28 trials

var predictable_conditions = [
  ["switch", "stay"],
  ["stay", "switch"],
];
var predictable_dimensions_list = [
  ["the same", "the same", "different", "different"],
  ["different", "different", "the same", "the same"],
];
var shape_matching_conditions = [
  "DDD",
  "SDD",
  "DSD",
  "DDS",
  "SSS",
  "SNN",
  "DNN",
];
var numConds =
  predictable_conditions.length *
  predictable_dimensions_list.length *
  shape_matching_conditions.length;
var possible_responses = [
  ["M Key", 77],
  ["Z Key", 90],
];

var fileTypePNG = ".png'></img>";
var preFileType =
  "<img class = center src='/static/experiments/shape_matching_with_spatial_task_switching__practice/images/";
var path =
  "/static/experiments/shape_matching_with_spatial_task_switching__practice/images/";
var colors = ["white", "red", "green"];

var exp_stage = "practice";
var current_trial = 0;

var shape_stim = [];
for (var i = 1; i < 11; i++) {
  for (var c = 0; c < 3; c++) {
    shape_stim.push(path + i + "_" + colors[c] + ".png");
  }
}
jsPsych.pluginAPI.preloadImages(shape_stim.concat(path + "mask.png"));

var task_boards = [
  [
    [
      "<div class = bigbox><div class = quad_box><div class = decision-top-left><div class = leftbox>",
    ],
    ["</div><div class = distractorbox>"],
    ["</div><div class = rightbox>"],
    [
      "</div></div><div class = decision-top-right></div><div class = decision-bottom-right></div><div class = decision-bottom-left></div></div></div>",
    ],
  ],
  [
    [
      "<div class = bigbox><div class = quad_box><div class = decision-top-left></div><div class = decision-top-right><div class = leftbox>",
    ],
    ["</div><div class = distractorbox>"],
    ["</div><div class = rightbox>"],
    [
      "</div></div><div class = decision-bottom-right></div><div class = decision-bottom-left></div></div></div>",
    ],
  ],
  [
    [
      "<div class = bigbox><div class = quad_box><div class = decision-top-left></div><div class = decision-top-right></div><div class = decision-bottom-right><div class = leftbox>",
    ],
    ["</div><div class = distractorbox>"],
    ["</div><div class = rightbox>"],
    ["</div></div><div class = decision-bottom-left></div></div></div>"],
  ],
  [
    [
      "<div class = bigbox><div class = quad_box><div class = decision-top-left></div><div class = decision-top-right></div><div class = decision-bottom-right></div><div class = decision-bottom-left><div class = leftbox>",
    ],
    ["</div><div class = distractorbox>"],
    ["</div><div class = rightbox>"],
    ["</div></div></div></div>"],
  ],
];

var mask_boards = [
  [
    [
      "<div class = bigbox><div class = quad_box><div class = decision-top-left><div class = leftbox>",
    ],
    ["</div><div class = rightbox>"],
    [
      "</div></div><div class = decision-top-right></div><div class = decision-bottom-right></div><div class = decision-bottom-left></div></div></div>",
    ],
  ],
  [
    [
      "<div class = bigbox><div class = quad_box><div class = decision-top-left></div><div class = decision-top-right><div class = leftbox>",
    ],
    ["</div><div class = rightbox>"],
    [
      "</div></div><div class = decision-bottom-right></div><div class = decision-bottom-left></div></div></div>",
    ],
  ],
  [
    [
      "<div class = bigbox><div class = quad_box><div class = decision-top-left></div><div class = decision-top-right></div><div class = decision-bottom-right><div class = leftbox>",
    ],
    ["</div><div class = rightbox>"],
    ["</div></div><div class = decision-bottom-left></div></div></div>"],
  ],
  [
    [
      "<div class = bigbox><div class = quad_box><div class = decision-top-left></div><div class = decision-top-right></div><div class = decision-bottom-right></div><div class = decision-bottom-left><div class = leftbox>",
    ],
    ["</div><div class = rightbox>"],
    ["</div></div></div></div>"],
  ],
];

var fixation_boards = [
  [
    "<div class = bigbox><div class = quad_box><div class = decision-top-left><div class = fixation>+</div></div></div></div>",
  ],
  [
    "<div class = bigbox><div class = quad_box><div class = decision-top-right><div class = fixation>+</div></div></div></div>",
  ],
  [
    "<div class = bigbox><div class = quad_box><div class = decision-bottom-right><div class = fixation>+</div></div></div></div>",
  ],
  [
    "<div class = bigbox><div class = quad_box><div class = decision-bottom-left><div class = fixation>+</div></div></div></div>",
  ],
];

var task_switches = makeTaskSwitches(practice_len); //added for spatial
var stims = createTrialTypes(task_switches, practice_len); //changed for spatial

var prompt_text_list =
  '<ul style="text-align:left;">' +
  "<li>Top 2 quadrants: Answer if the green and white shapes are " +
  predictable_dimensions[0] +
  "</li>" +
  "<li>" +
  predictable_dimensions[0] +
  ": " +
  possible_responses[0][0] +
  "</li>" +
  "<li>" +
  predictable_dimensions[2] +
  ": " +
  possible_responses[1][0] +
  "</li>" +
  "<li>Bottom 2 quadrants: Answer if the green and white shapes are " +
  predictable_dimensions[2] +
  "</li>" +
  "<li>" +
  predictable_dimensions[2] +
  ": " +
  possible_responses[0][0] +
  "</li>" +
  "<li>" +
  predictable_dimensions[0] +
  ": " +
  possible_responses[1][0] +
  "</li>" +
  "</ul>";

var prompt_text =
  "<div class = prompt_box>" +
  '<p class = center-block-text style = "font-size:20px; line-height:80%%;">Top 2 quadrants: Answer if the green and white shapes are ' +
  predictable_dimensions[0] +
  "</p>" +
  '<p class = center-block-text style = "font-size:20px; line-height:80%%;">' +
  predictable_dimensions[0] +
  ": " +
  possible_responses[0][0] +
  " | " +
  predictable_dimensions[2] +
  ": " +
  possible_responses[1][0] +
  "</p>" +
  "<p>&nbsp</p>" +
  '<p class = center-block-text style = "font-size:20px; line-height:80%%;">Bottom 2 quadrants: Answer if the green and white shapes are ' +
  predictable_dimensions[2] +
  "</p>" +
  '<p class = center-block-text style = "font-size:20px; line-height:80%%;">' +
  predictable_dimensions[2] +
  ": " +
  possible_responses[0][0] +
  " | " +
  predictable_dimensions[0] +
  ": " +
  possible_responses[1][0] +
  "</p>" +
  "</div>";
/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */

var feedback_text =
  "Welcome to the experiment. This practice will take a few minutes. Press <i>enter</i> to begin.";
var feedback_block = {
  type: "poldrack-single-stim",
  data: {
    trial_id: "feedback_block",
  },
  choices: [13],
  stimulus: getFeedback,
  timing_post_trial: 0,
  is_html: true,
  timing_response: 180000,
  response_ends_trial: true,
};

var feedback_instruct_text =
  "Welcome to the experiment. This practice will take a few minutes. Press <i>enter</i> to begin.";
var feedback_instruct_block = {
  type: "poldrack-text",
  data: {
    trial_id: "instruction",
  },
  cont_key: [13],
  text: getInstructFeedback,
  timing_post_trial: 0,
  timing_response: 180000,
};

/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
  type: "poldrack-instructions",
  data: {
    trial_id: "instruction",
  },
  pages: [
    "<div class = centerbox>" +
      "<p class = block-text>In this experiment, across trials you will see shapes on the screen in one of 4 quadrants. " +
      "On every trial, one quadrant will have a white shape on the right and a green shape on the left.</p> " +
      "<p class = block-text>You will be asked if the green shape is the same as or different from the white shape, depending on which quadrant " +
      "the shapes are in.</p>" +
      "</div>",

    "<div class = centerbox>" +
      "<p class = block-text>When in the top two quadrants, please judge whether the two shapes are <i>" +
      predictable_dimensions[0] +
      "</i>. Press the <i>" +
      possible_responses[0][0] +
      "  </i>if they are <i>" +
      predictable_dimensions[0] +
      "</i>, and the <i>" +
      possible_responses[1][0] +
      "  </i>if they are <i>" +
      predictable_dimensions[2] +
      "</i>.</p>" +
      "<p class = block-text>When in the bottom two quadrants, please judge whether the two shapes are <i>" +
      predictable_dimensions[2] +
      ".</i>" +
      " Press the <i>" +
      possible_responses[0][0] +
      " </i> if they are <i>" +
      predictable_dimensions[2] +
      "</i>, and the <i>" +
      possible_responses[1][0] +
      " </i> if they are <i>" +
      predictable_dimensions[0] +
      "</i>.</p>" +
      "<p class = block-text>On some trials a red shape will also be presented on the left. " +
      "You should ignore the red shape — your task is to respond based on whether the white and green shapes match or mismatch.</p>" +
      "</div>",

    "<div class = centerbox>" +
      "<p class = block-text>We will start practice when you finish instructions. Please make sure you understand the instructions before moving on. During practice, you will receive a reminder of the rules." +
      "</div>",
  ],
  allow_keys: false,
  show_clickable_nav: true,
  timing_post_trial: 1000,
};

var instruction_node = {
  timeline: [feedback_instruct_block, instructions_block],
  /* This function defines stopping criteria */
  loop_function: function (data) {
    for (i = 0; i < data.length; i++) {
      if (data[i].trial_type == "poldrack-instructions" && data[i].rt != -1) {
        rt = data[i].rt;
        sumInstructTime = sumInstructTime + rt;
      }
    }
    if (sumInstructTime <= instructTimeThresh * 1000) {
      feedback_instruct_text =
        "Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <i>enter</i> to continue.";
      return true;
    } else if (sumInstructTime > instructTimeThresh * 1000) {
      feedback_instruct_text =
        "Done with instructions. Press <i>enter</i> to continue.";
      return false;
    }
  },
};

var end_block = {
  type: "poldrack-text",
  data: {
    trial_id: "end",
  },
  timing_response: 180000,
  text: "<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <i>enter</i> to continue.</p></div>",
  cont_key: [13],
  timing_post_trial: 0,
  on_finish: function () {
    assessPerformance();
  },
};

var rest_block = {
  type: "poldrack-text",
  data: {
    trial_id: "instruction",
  },
  timing_response: 180000,
  text: "<div class = centerbox><p class = center-block-text>Take a short break!</p><p class = center-block-text>Press <i>enter</i> to continue the test.</p></div>",
  cont_key: [13],
  timing_post_trial: 1000,
};

var practiceTrials = [];
practiceTrials.push(feedback_block);
practiceTrials.push(instructions_block);
for (i = 0; i < practice_len + 1; i++) {
  var fixation_block = {
    type: "poldrack-single-stim",
    stimulus: getFixation,
    is_html: true,
    data: {
      trial_id: "practice_fixation",
    },
    choices: "none",
    timing_response: 500, //500
    timing_post_trial: 0,
    response_ends_trial: false,
    prompt: prompt_text,
  };

  var practice_block = {
    type: "poldrack-categorize",
    stimulus: getStim,
    is_html: true,
    choices: [possible_responses[0][1], possible_responses[1][1]],
    key_answer: getResponse,
    data: {
      trial_id: "practice_trial",
    },
    correct_text:
      "<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>" +
      prompt_text,
    incorrect_text:
      "<div class = fb_box><div class = center-text><font size = 20>Incorrect</font></div></div>" +
      prompt_text,
    timeout_message:
      "<div class = fb_box><div class = center-text><font size = 20>Respond Faster!</font></div></div>" +
      prompt_text,
    timing_stim: 1000, //1000
    timing_response: 2000, //2000
    timing_feedback_duration: 500,
    show_stim_with_feedback: false,
    timing_post_trial: 0,
    on_finish: appendData,
    prompt: prompt_text,
  };
  practiceTrials.push(fixation_block);
  practiceTrials.push(practice_block);
}

var practiceCount = 0;
var practiceNode = {
  timeline: practiceTrials,
  loop_function: function (data) {
    practiceCount += 1;
    task_switches = makeTaskSwitches(practice_len);
    stims = createTrialTypes(task_switches, practice_len);
    current_trial = 0;

    var sum_rt = 0;
    var sum_responses = 0;
    var correct = 0;
    var total_trials = 0;

    for (var i = 0; i < data.length; i++) {
      if (data[i].trial_id == "practice_trial") {
        total_trials += 1;
        if (data[i].rt != -1) {
          sum_rt += data[i].rt;
          sum_responses += 1;
          if (data[i].key_press == data[i].correct_response) {
            correct += 1;
          }
        }
      }
    }

    var accuracy = correct / total_trials;
    var missed_responses = (total_trials - sum_responses) / total_trials;
    var ave_rt = sum_rt / sum_responses;

    feedback_text =
      "<br>Please take this time to read your feedback and to take a short break! Press enter to continue";

    if (accuracy > accuracy_thresh) {
      feedback_text +=
        "</p><p class = block-text>Done with this practice. Press Enter to end practice.";
      task_switches = makeTaskSwitches(numTrialsPerBlock);
      stims = createTrialTypes(task_switches, numTrialsPerBlock);
      return false;
    } else if (accuracy < accuracy_thresh) {
      feedback_text +=
        "</p><p class = block-text>We are going to try practice again to see if you can achieve higher accuracy.  Remember: <br>" +
        prompt_text_list;

      if (missed_responses > missed_thresh) {
        feedback_text +=
          "</p><p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.";
      }

      if (ave_rt > rt_thresh) {
        feedback_text +=
          "</p><p class = block-text>You have been responding too slowly.";
      }

      if (practiceCount == practice_thresh) {
        feedback_text += "</p><p class = block-text>Done with this practice.";
        return false;
      }

      feedback_text +=
        "</p><p class = block-text>Redoing this practice. Press Enter to continue.";

      return true;
    }
  },
};

/* create experiment definition array */
shape_matching_with_spatial_task_switching__practice_experiment = [];

shape_matching_with_spatial_task_switching__practice_experiment.push(
  practiceNode
);
shape_matching_with_spatial_task_switching__practice_experiment.push(
  feedback_block
);
shape_matching_with_spatial_task_switching__practice_experiment.push(end_block);
