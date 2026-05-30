const findOrCreateSkills = async (skills, Skill) => {
  return Promise.all(
    skills.map(async (name) => {
      const [skill] = await Skill.findOrCreate({
        where: { name: name.toLowerCase() },
      });
      return skill;
    }),
  );
};

module.exports = { findOrCreateSkills };
